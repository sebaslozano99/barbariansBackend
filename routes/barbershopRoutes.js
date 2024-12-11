const { Router } = require("express");
const { getProfile, postBarbershop, editBarbershop } = require("../controllers/barbershopControllers.js");
const upload = require("../config/multer.js");

const barbershopRoutes = Router();
//All routes: /profile - GET, /setup - POST/PUT, /appointment - GET, /dashboard - GET , /reviews - GET



barbershopRoutes.get("/profile/:userID", getProfile);
barbershopRoutes.post("/setup", upload.array("images", 10) , postBarbershop);
barbershopRoutes.put("/edit/:userID", upload.array("images", 10), editBarbershop);



module.exports = barbershopRoutes;