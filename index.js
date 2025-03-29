const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

connectDB();

app.use(bodyParser.json());
app.use(cors());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT | 5001;

app.listen(() => console.log(`Server is running on port ${PORT}`));
