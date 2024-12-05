const { Router } = require("express");
const { signup, login, logout, validateTokenOnPageReload } = require("../controllers/userControllers.js");


const userRoutes = Router();


userRoutes.post("/signup", signup);
userRoutes.post("/login", login);
userRoutes.post("/logout", logout);
userRoutes.get("/validate-token", validateTokenOnPageReload);


module.exports = userRoutes;