const database = require("../config/database.js");
const { getBarbershopInformation, createBarbershop } = require("../models/barbershopModel.js");
const fs = require("fs");



// GET request
const getProfile = async (req, res) => {
    
    const { userID } = req.params;

    try {

        const barbershopInfo = await getBarbershopInformation(userID);

        if(!barbershopInfo.length) return res.status(200).json(barbershopInfo);

        res.status(200).json(barbershopInfo[0]);

    }
    catch(error){
        console.error(error);
        res.status(500).json({message: error.message || "Internal server error!"});
    }

}




// POST request
const postBarbershop = async (req, res) => {

    const { user_id, business_name, description, address, open_time, close_time, phone, services } = req.body;
    const imagesFiles = req.files;

    // services is an array of objects that was stringyfied in the FormData so that I could be read here
    const servicesObject = services.map((service) => JSON.parse(service));

    try {
        await createBarbershop({user_id, business_name, description, address, open_time, close_time, phone, imagesFiles, servicesObject});
        return res.status(201).json({ message: "Barbershop set up successfully!" });
    }
    catch(error){
        
        console.log( "Error inserting data: ", error.message);

        if(error.message.includes("Duplicate entry") && error.message.includes("for key 'barbershops.business_name'")){
            return res.status(409).json({message: "Barbershop name already exists!"});
        }

        if(error.message.includes("Duplicate entry") && error.message.includes("for key 'barbershops.unique_phone'")){
            return res.status(409).json({message: "Phone number already exists in a different barbershop!"});
        }

        res.status(500).json({message: error.message || "Internal server error"});
    }
}






const editBarbershop = async (req, res) => {

    const { userID } = req.params;
    const { business_name, description, address, open_time, close_time, phone, services } = req.body;
    const imagesFiles = req.files;

    const servicesObject = services?.map((service) => JSON.parse(service)); 

    const dbConnection = await database.getConnection();

    await dbConnection.beginTransaction();

    try {
        // get user's barbershop's information
        const [rows] = await dbConnection.execute("SELECT id FROM barbershops WHERE user_id = ?", [userID]);

        const userBarbershopID = rows[0].id;

        const [result] = await dbConnection.execute(`
            UPDATE barbershops 
                SET business_name = IFNULL(?, business_name),
                    description = IFNULL(?, description),
                    address = IFNULL(?, address),
                    open_time = IFNULL(?, open_time),
                    close_time = IFNULL(?, close_time),
                    phone = IFNULL(?, phone) 
            WHERE id = ?`, [business_name, description, address, open_time, close_time, phone, userBarbershopID]
        );


        
        // it might happen that if the images are deleted from DB and system, but then any of the 'services' queries fails, the db will rollback, but the images would be gone anyway

        if(imagesFiles?.length > 0){
            // Get image_url of barbershop to delete from system
            const [barbershop_images] = await dbConnection.execute("SELECT image_path FROM barbershop_images WHERE barbershop_id = ?", [userBarbershopID]);


            const [imagesDelete] = await dbConnection.execute("DELETE FROM barbershop_images WHERE barbershop_id = ?", [userBarbershopID]);

            // Delete previous images from system
            for(const image of barbershop_images) {
                fs.unlink(__dirname + `../../uploads/${image.image_path}`, (err) => {
                    if(err) console.log(`An error ocurred: ${err}`);
                    else console.log("File delete successfully!");
                })
            }
    
            for(const image of imagesFiles){
                await dbConnection.execute("INSERT INTO barbershop_images (barbershop_id, image_path) VALUES (?, ?)", [userBarbershopID, image.filename])
            }
        }

        if(servicesObject?.length > 0){

            const [servicesDelete] = await dbConnection.execute("DELETE FROM barbershop_services WHERE barbershop_id = ?", [userBarbershopID]);

            for(const service of servicesObject){
                await dbConnection.execute("INSERT INTO barbershop_services (barbershop_id, service, price) VALUES (?, ?, ?)", [userBarbershopID, service.service, service.price])
            }
        }

        await dbConnection.commit();

        return res.status(201).json({ message: "Updated successfully!" });

    }
    catch(error){
        
        await dbConnection.rollback();
        
        console.log( "Error updating data: ", error.message);

        res.status(500).json({message: error.message || "Internal server error"});
    }
    finally {
        dbConnection.release();
    }
}




module.exports = { getProfile, postBarbershop, editBarbershop }