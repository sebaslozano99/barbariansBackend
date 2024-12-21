const database = require("../config/database.js");


async function getBarbershopInformation(userID){
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


module.exports = getBarbershopInformation;