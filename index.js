const express = require("express");
const userRoutes = require("./routes/userRoutes.js");
require("dotenv").config();


const app = express();



// settings



// middlewares




// routes
app.use("/api/auth/", userRoutes);




const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
})