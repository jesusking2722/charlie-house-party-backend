const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const setupSocket = require("./socket");

// routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const openAiRoutes = require("./routes/openAiRoutes");
const partyRoutes = require("./routes/partyRoutes");
const messageRoutes = require("./routes/messageRoutes");
require("dotenv").config();

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
app.use("/api/party", partyRoutes);
app.use("/api/message", messageRoutes);

const PORT = 5001;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
