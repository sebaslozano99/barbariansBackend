const database = require("../config/database.js");


async function getBarbershopInformation(userID){
    try {

        const [rows] = await database.execute(`
            SELECT 
                barbershops.id AS barbershop_id,
                business_name,
                description,
                address,
                open_time,
                close_time,
                phone,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'image_id', barbershop_images.id,
                        'image_path', barbershop_images.image_path
                    )
                ) AS images,
                (
                    SELECT 
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'service_id', barbershop_services.id,
                                'service', barbershop_services.service,
                                'price', barbershop_services.price
                            )
                        ) AS services_array
                    FROM barbershop_services
                    WHERE barbershop_services.barbershop_id = barbershops.id
                ) AS services
            FROM barbershops
            LEFT JOIN barbershop_images ON barbershop_images.barbershop_id = barbershops.id
            WHERE user_id = ?
            GROUP BY barbershops.id
        `, [userID]);

        return rows;
    }
    catch(error){
        throw new Error(`Error retrieving barbershop's information!`);
    }

}


async function createBarbershop({user_id, business_name, description, address, open_time, close_time, phone, imagesFiles, servicesObject}){

     // STEPS FOR ATOMIC transaction  -- Either all queries go through or all fail

    // 1) get connection and begin transaction
    const dbConnection = await database.getConnection();
    await dbConnection.beginTransaction();

    try{
        const [result] = await dbConnection.execute("INSERT INTO barbershops (user_id, business_name, description, address, open_time, close_time, phone) VALUES (?, ?, ?, ?, ?, ?, ?)", [user_id, business_name, description, address, open_time, close_time, phone]);

        const newBarbershopID = result.insertId;

        for (const image of imagesFiles) {
            await dbConnection.execute("INSERT INTO barbershop_images (barbershop_id, image_path) VALUES (?, ?)", [newBarbershopID, image.filename]);
        }

        for (const service of servicesObject) {
            await dbConnection.execute("INSERT INTO barbershop_services (barbershop_id, service, price) VALUES (?, ?, ?)", [newBarbershopID, service.service, service.price]);
        }

        // 2) Commit changes to database if everything goes through
        await dbConnection.commit();
    }
    catch(error){
        // 2) Rollback changes to database if anything goes wrong
        await dbConnection.rollback();
        throw new Error(error);
    }
    finally{
        // 3) release connection
        dbConnection.release();
    }
}


module.exports = { getBarbershopInformation, createBarbershop };