const database = require("../config/database.js");



// GET request
const profile = async (req, res) => {
    const { userID } = req.params;

    // step 01 -- begin transaction
    const dbConnection = await database.getConnection();
    await dbConnection.beginTransaction();

    // step 02 -- execute all transactions
    try {
        // fetch barbershop's information
        const [rows] = await dbConnection.execute(`
        SELECT 
            users.id AS user_id,
            barbershops.id AS barbershop_id,
            business_name,
            description,
            address,
            open_time,
            close_time,
            phone
        FROM users
        INNER JOIN barbershops ON barbershops.user_id = ?
        WHERE users.id = ?`, [userID, userID]);

        const barbershopID = rows[0].barbershop_id;

        //fetch barbershop's images
        const [images] = await dbConnection.execute("SELECT id AS image_id, image_path FROM barbershop_images WHERE barbershop_id = ?", [barbershopID]);

        // fetch barbershop's services
        const [services] = await dbConnection.execute("SELECT service, price FROM barbershop_services WHERE barbershop_id = ?", [barbershopID]);

        const barbershopInformation = { ...rows[0], images, services };
        
        // step 03 -- commit if all transactions go through successfully!
        await dbConnection.commit();
        
        res.status(200).json({ barbershopInformation });

    }
    catch(error){
        // step 03 -- rollback if any of the transactions fails
        await dbConnection.rollback();
        res.status(500).json({message: error.message || "Internal server error!"});
    }
    finally {
        // step 04 -- release db connection
        dbConnection.release();
    }

}




// POST request
const setup = async (req, res) => {

    const { user_id, business_name, description, address, open_time, close_time, phone, services } = req.body;
    const imagesFiles = req.files;

    // services is an array of objects that was stringyfied in the FormData so that I could be read here
    const servicesObject = services.map((service) => JSON.parse(service));

    // STEPS FOR ATOMIC transaction  -- Either all queries go through or all fail

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







module.exports = { setup, profile }