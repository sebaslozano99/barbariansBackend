const database = require("../config/database.js");



const setup = async (req, res) => {
    const { user_id, business_name, description, address, open_time, close_time, phone, services } = req.body;
    const imagesFiles = req.files; //array of objects with the file information

    // services is an array of objects that was stringyfied in the FormData so that I could be read here
    const servicesObject = services.map((service) => JSON.parse(service));

    // step 01 -- start db transaction
    const dbConnection = await database.getConnection();
    await dbConnection.beginTransaction();

    // step 02 -- execute all the transactions 
    try {
        const [result] = await dbConnection.execute("INSERT INTO barbershops (user_id, business_name, description, address, open_time, close_time, phone) VALUES (?, ?, ?, ?, ?, ?, ?)", [user_id, business_name, description, address, open_time, close_time, phone]);

        const newBarbershopID = result.insertId;

        for (const image of imagesFiles) {
            await dbConnection.execute("INSERT INTO barbershop_images (barbershop_id, image_path) VALUES (?, ?)", [newBarbershopID, image.filename]);
        }

        for (const service of servicesObject) {
            await dbConnection.execute("INSERT INTO barbershop_services (barbershop_id, service, price) VALUES (?, ?, ?)", [newBarbershopID, service.service, service.price]);
        }
        

        // step 03 -- Commit if everything goes well
        await dbConnection.commit();

        return res.json({ message: "Inserted data successfully!" });

    }
    catch(error){
        // step 03 -- Rollback if something goes wrong
        await dbConnection.rollback();
        
        console.log( "Error inserting data: ", error.message);

        if(error.message.includes("Duplicate entry") && error.message.includes("for key 'barbershops.business_name'")){
            return res.status(409).json({message: "Barbershop name already exists!"});
        }

        if(error.message.includes("Duplicate entry") && error.message.includes("for key 'barbershops.unique_phone'")){
            return res.status(409).json({message: "Phone number already exists in a different barbershop!"});
        }

        res.status(500).json({message: error.message || "Internal server error"});
    }
    finally {
        // step 04 -- Realease the connection back to the pool
        dbConnection.release();
    }
}



const profile = (req, res) => {
    
    res.json({message: "PROFILE"});
}



module.exports = { setup, profile }