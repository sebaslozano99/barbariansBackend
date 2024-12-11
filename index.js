const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes.js");
const barbershopRoutes = require("./routes/barbershopRoutes.js");


const app = express();


const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true
};


// settings



// middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("uploads"));


// routes
app.use("/api/auth", userRoutes);
app.use("/api/barbershop", barbershopRoutes);



const PORT = process.env.PORT || 4000;


app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
})