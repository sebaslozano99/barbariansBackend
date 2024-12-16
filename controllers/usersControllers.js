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
                image_path,
                barbershop_services.id AS service_id,
                barbershop_services.barbershop_id,
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
            if(!structuredBarbershopsData.some(curr => curr.barbershop_id === barber.barbershop_id)) return;

            structuredBarbershopsData. forEach((item) => {
                if(item.barbershop_id === barber.barbershop_id && !item.images.includes(barber.image_path)){
                    item.images.push(barber.image_path);
                }
            })
        });

        barbershopsInfo.forEach((barber) => {
            if(!structuredBarbershopsData.some(curr => curr.barbershop_id === barber.barbershop_id)) return;

            structuredBarbershopsData. forEach((item) => {
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





module.exports = { getAllBarbers }