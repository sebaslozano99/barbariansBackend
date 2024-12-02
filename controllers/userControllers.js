const database = require("../config/database.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();



const signup = async (req, res) => {

    const { first_name, last_name, email, password, role } = req.body;

    if(typeof first_name !== "string" || typeof last_name !== "string") return res.status(400).json({message: "name and last name must be string!"});
    if(!email.includes("@")) return res.status(400).json({message: "Email must have '@' sign!"});
    if(password.length < 6) return res.status(400).json({message: "Password must be at least 6 characters long!"});

    try{
        //make sure Email address is Unique before initializing insertion
        const [rows] = await database.execute("SELECT * FROM users WHERE email = ?", [email]);

        if(rows.length) return res.status(409).json({message: "Email already exists!"});

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await database.execute(`INSERT INTO users (first_name, last_name, email, password, role) VALUES 
        (?, ?, ?, ?, ?)`, [first_name, last_name, email, hashedPassword, role]);

        const token = jwt.sign({first_name, last_name, email, id: result.insertId}, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        req.cookie("token", token, { httpOnly: true });
        res.status(201).json({message: "user created successfully!"});

    }
    catch(error){
        res.status(500).json({message: error.message || "Internal server error"});
    }
}




const login = async (req, res) => {
    const { email, password } = req.body;

    if(!email.includes("@")) return res.status(400).json({message: "Email address must contain '@' sign!"});

    try{
        //Make sure exists an user with email provided
        const [rows] = await database.execute("SELECT * FROM users WHERE email = ?", [email]);

        if(!rows.length) return res.status(404).json({message: "User with the email provided does not exist!"});

        const isSamePassword = await bcrypt.compare(password, rows[0].password);

        if(!isSamePassword) return res.status(401).json({message: "Invalid password!"});

        const token = jwt.sign({first_name, last_name, email, id: result.insertId}, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        res.cookie("token", token, { expiresIn: "1h" });
        res.status(201).json({message: "logged in successfully!"});
    }
    catch(error){
        res.status(500).json({message: error.message || "Internal server error"});
    }
}



const logout = async (req, res) => {
    try{
        req.clearCookie("token");
        res.status(200).json({message: "Logged out sucessfully!"});
    }
    catch(error){
        res.status(500).json({message: error.message || "Internal server error"});
    }
}


module.exports = { signup, login, logout }