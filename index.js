const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const openAiRoutes = require("./routes/openAiRoutes");
const http = require("http");
const setupSocket = require("./socket");

const app = express();

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: process.env.FRONT_BASE_URL,
    methods: ["GET", "POST"],
  },
});

setupSocket(io);
connectDB();

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", openAiRoutes);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
