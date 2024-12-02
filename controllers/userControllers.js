const database = require("../config/database.js");


const login = (req, res) => {
    const { email, password } = req.body;

    try{
        
    }
    catch(error){
        res.status(500).json({message: error.message || "Internal server error"});
    }
}