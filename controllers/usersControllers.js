const database = require("../config/database.js");


const getAllBarbers = async (req, res) => {

    try {

        const [barbershopsInfo] = await database.execute(`
            SELECT 
                barbershops.id AS barbershop_id,
                business_name,
                address,
                phone,
                barbershop_images.barbershop_id AS image_barberid,
                barbershop_images.id AS image_id,
                image_path,
                service
            FROM barbershops
            JOIN barbershop_images ON barbershop_images.barbershop_id = barbershops.id
            JOIN barbershop_services ON barbershop_services.barbershop_id = barbershops.id;
        `);

        let structuredBarbershopsData = [];

        barbershopsInfo.forEach((barber) => {
            if(!structuredBarbershopsData.some(curr => curr.barbershop_id === barber.barbershop_id)) {

                const { barbershop_id, business_name, address, phone } = barber;
                structuredBarbershopsData.push({barbershop_id, business_name, address, phone, images: [], services: []})
            };
        });


        barbershopsInfo.forEach((barber) => {
            structuredBarbershopsData.forEach((item) => {

                if(item.barbershop_id === barber.barbershop_id && !item.images.some(curr => curr.image_id === barber.image_id)){
                    item.images.push({image_id: barber.image_id, image_path: barber.image_path});
                }
            })
        });

        barbershopsInfo.forEach((barber) => {
            if(!structuredBarbershopsData.some(curr => curr.barbershop_id === barber.barbershop_id)) return;

            structuredBarbershopsData.forEach((item) => {
                if(item.barbershop_id === barber.barbershop_id && !item.services.includes(barber.service)){
                    item.services.push(barber.service);
                }
            })
        });

        res.status(200).json(structuredBarbershopsData);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: error.message || "Internal Server Error!"});
    }
}





const getSingleBarbershop = async (req, res) => {
    
    const { barbershopID } = req.params;

    try {
        const [barbershopsInfo] = await database.execute(`
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
                                'service_id', service.id,
                                'service_price', service.price,
                                'service_service', service.service
                            )
                        )
                    FROM barbershop_services service
                    WHERE service.barbershop_id = barbershops.id
                ) AS services

            FROM barbershops
            LEFT JOIN barbershop_images ON barbershop_images.barbershop_id = barbershops.id
            WHERE barbershops.id = ?
            GROUP BY barbershops.id;
            `, 
        [barbershopID]);

        if(!barbershopsInfo.length) return res.status(404).json({message: "Barbershop was not found!"});


        const barbershopData = {
            barbershop_id: barbershopsInfo[0].barbershop_id, 
            business_name: barbershopsInfo[0].business_name, 
            description: barbershopsInfo[0].description, 
            address: barbershopsInfo[0].address, 
            open_time: barbershopsInfo[0].open_time, 
            close_time: barbershopsInfo[0].close_time, 
            phone: barbershopsInfo[0].phone, 
            images: barbershopsInfo[0].images, 
            services: barbershopsInfo[0].services
        }

        res.status(200).json(barbershopData);
        
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: error.message || "Internal Server Error!"});
    }
}





module.exports = { getAllBarbers, getSingleBarbershop }