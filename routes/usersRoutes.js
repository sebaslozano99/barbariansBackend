const { Router } = require("express");
const { getAllBarbers, getSingleBarbershop } = require("../controllers/usersControllers.js");

const usersRoutes = Router();


usersRoutes.get("/getallbarbers", getAllBarbers);
usersRoutes.get("/getsinglebarbershop/:barbershopID", getSingleBarbershop);



module.exports = usersRoutes;