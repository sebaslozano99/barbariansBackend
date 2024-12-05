const { Router } = require("express");
const { setup, profile } = require("../controllers/barbershopControllers.js");
const upload = require("../config/multer.js");

const barbershopRoutes = Router();
//All routes: /profile - GET, /setup - POST/PUT, /appointment - GET, /dashboard - GET , /reviews - GET



barbershopRoutes.get("/profile", profile);
barbershopRoutes.post("/setup", upload.array("images", 10) , setup);



module.exports = barbershopRoutes;