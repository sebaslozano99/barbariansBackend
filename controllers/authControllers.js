const database = require("../config/database.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { getUserByEmail, createNewUser } = require("../models/authModel.js");




const validateTokenOnPageReload = async (req, res) => {
    const { token } = req.cookies;

    if(!token) return res.status(401).json({message: "Invalid/Expired token!"});

    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
        if(error) return res.status(401).json({message: "Invalid token"});

        const { id, first_name, last_name, email, role } = decoded;
        return res.json({id, first_name, last_name, email, role});
    })

}




const signup = async (req, res) => {

    const { first_name, last_name, email, password, role } = req.body;

    if(typeof first_name !== "string" || typeof last_name !== "string") return res.status(400).json({message: "name and last name must be string!"});
    if(!email.includes("@")) return res.status(400).json({message: "Email must have '@' sign!"});
    if(password.length < 6) return res.status(400).json({message: "Password must be at least 6 characters long!"});

    try{
        //make sure Email address is Unique before initializing insertion
        const rows = await getUserByEmail(email);

        if(rows.length) return res.status(409).json({message: "Email already exists!"});

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await createNewUser({first_name, last_name, email, hashedPassword, role});

        const user = { id: result.insertId, first_name, last_name, email, role };

        const token = jwt.sign( user, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        res.cookie("token", token, { httpOnly: true });
        res.status(201).json({message: "user created successfully!", user});

    }
    catch(error){
        console.error(error);
        res.status(500).json({message: error.message || "Internal server error"});
    }
}




const login = async (req, res) => {
    const { email, password } = req.body;

    if(!email.includes("@")) return res.status(400).json({message: "Email address must contain '@' sign!"});

    try{
        //Make sure exists an user with email provided
        const rows = await getUserByEmail(email);

        if(!rows.length) return res.status(404).json({message: "User doesn't exist!"});

        const isSamePassword = await bcrypt.compare(password, rows[0].password);

        if(!isSamePassword) return res.status(401).json({message: "Invalid password!"});

        const user = { id: rows[0].id, first_name: rows[0].first_name, last_name: rows[0].last_name, email, role: rows[0].role };

        const token = jwt.sign(user , process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        res.cookie("token", token, { expiresIn: "1h" });
        res.status(201).json({message: "logged in successfully!", user});
    }
    catch(error){
        res.status(500).json({message: error.message || "Internal server error"});
    }
}



const logout = async (req, res) => {
    try{
        res.clearCookie("token");
        res.status(200).json({message: "Logged out sucessfully!"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: error.message || "Internal server error"});
    }
}


module.exports = { signup, login, logout, validateTokenOnPageReload }