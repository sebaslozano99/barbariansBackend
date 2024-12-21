const database = require("../config/database.js");

async function getUserByEmail(email){
    const [rows] = await database.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows;
}


async function createNewUser({first_name, last_name, email, hashedPassword, role}){
    const [result] = await database.execute(`INSERT INTO users (first_name, last_name, email, password, role) VALUES 
    (?, ?, ?, ?, ?)`, [first_name, last_name, email, hashedPassword, role]);

    return result;
}



module.exports = { getUserByEmail, createNewUser }