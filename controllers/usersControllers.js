const database = require("../config/database.js");


const getAllBarbers = async (req, res) => {
    
    const dbConnection = await database.getConnection();
    await dbConnection.beginTransaction();

    let jsonData;

    try {
        const [barbershops] = await dbConnection.execute("SELECT id, business_name, address, phone FROM barbershops");

        const [images] = await dbConnection.execute("SELECT id, barbershop_id, image_path FROM barbershop_images");

        const [services] = await dbConnection.execute("SELECT barbershop_id, service, price FROM barbershop_services");

        jsonData = barbershops.map((barbershop) => {
            const { id, business_name, address, phone } = barbershop;
            return { 
                barbershop_id: id, 
                business_name, 
                address, 
                phone, 
                images: images.filter((image) => image.barbershop_id === id), 
                services: services.filter((service) => service.barbershop_id === id)
            }
        });

        await dbConnection.commit();

        res.status(200).json(jsonData);
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