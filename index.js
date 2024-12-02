const express = require("express");
const userRoutes = require("./routes/userRoutes.js");
const cookieParser = require("cookie-parser");
require("dotenv").config();


const app = express();



// settings



// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));



// routes
app.use("/api/auth/", userRoutes);




const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
})