const { Router } = require("express");
const { getAllBarbers } = require("../controllers/usersControllers.js");

const usersRoutes = Router();


usersRoutes.get("/getallbarbers", getAllBarbers);




module.exports = usersRoutes;