const database = require("../config/database.js");


const getAllBarbers = async (req, res) => {
    
    const dbConnection = await database.getConnection();
    await dbConnection.beginTransaction();

    try {

        const [barbershopsInfo] = await dbConnection.execute(`
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

        await dbConnection.commit();

        res.status(200).json(structuredBarbershopsData);
    }
    catch(error){
        await dbConnection.rollback();
        res.status(500).json({message: error.message || "Internal Server Error!"});
    }
    finally {
        dbConnection.release()
    }
}





const getSingleBarbershop = async (req, res) => {
    
    const { barbershopID } = req.params;

    const dbConnection = await database.getConnection();
    await dbConnection.beginTransaction();

    try {

        const [barbershopsInfo] = await dbConnection.execute(`
            SELECT 
                barbershops.id AS barbershop_id,
                business_name,
                description,
                address,
                open_time,
                close_time,
                phone,
                barbershop_images.id AS image_id,
                barbershop_images.barbershop_id AS image_barberid,
                image_path,
                barbershop_services.id AS service_id,
                barbershop_services.barbershop_id AS service_barberid,
                service,
                price
            FROM barbershops
            JOIN barbershop_images ON barbershop_images.barbershop_id = barbershops.id
            JOIN barbershop_services ON barbershop_services.barbershop_id = barbershops.id
            WHERE barbershops.id = ?`, [barbershopID]);

        if(!barbershopsInfo.length) return res.status(404).json({message: "Barbershop was not found!"});

        const barbershopData = {
            barbershop_id: barbershopsInfo[0].barbershop_id, 
            business_name: barbershopsInfo[0].barbershop_id, 
            description: barbershopsInfo[0].description, 
            address: barbershopsInfo[0].address, 
            open_time: barbershopsInfo[0].open_time, 
            close_time: barbershopsInfo[0].close_time, 
            phone: barbershopsInfo[0].phone, 
            images: [], 
            services: []
        }


        barbershopsInfo.forEach((barbershop) => {

            if(barbershopData.images.some(curr => curr.image_id === barbershop.image_id)) return;

            barbershopData.images.push({image_id: barbershop.image_id, image_path: barbershop.image_path});
        });


        barbershopsInfo.forEach((barbershop) => {

            if(barbershopData.services.some(curr => curr.service_id === barbershop.service_id)) return;

            barbershopData.services.push({service_id: barbershop.service_id, service: barbershop.service, price: barbershop.price});
        });


        res.status(200).json(barbershopData);
    }
    catch(error){
        await dbConnection.rollback();
        res.status(500).json({message: error.message || "Internal Server Error!"});
    }
    finally {
        dbConnection.release()
    }
}





module.exports = { getAllBarbers, getSingleBarbershop }