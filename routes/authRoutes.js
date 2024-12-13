const { Router } = require("express");
const { signup, login, logout, validateTokenOnPageReload } = require("../controllers/authControllers.js");


const authRoutes = Router();


authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.get("/validate-token", validateTokenOnPageReload);


module.exports = authRoutes;