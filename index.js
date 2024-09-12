const express = require("express");
// const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Message = require("./models/messageModel");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/MessageRoutes");
const chatRoutes = require("./routes/chatRoutes");
const countryRoutes = require("./routes/countryRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const cors = require("cors");
const { initSocket } = require("./socket/socket");
const ChatNew = require("./models/newChatModel");
const { deleteChatsForDeletedUsers } = require("./misc/deleteChat");
const { createChatsForAllUsers } = require("./controllers/chatController");
require("dotenv").config();
connectDB();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*", // Replace with your Vercel frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
    credentials: true, // Allow cookies to be sent
  })
);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/country", countryRoutes);
app.use("/api/subject", subjectRoutes);
console.log(process.env.OTP_SECRET_KEY);
const http = require("http").createServer(app);
const getData = async () => {
  await deleteChatsForDeletedUsers();
  // const data = await createChatsForAllUsers();
};
console.log("on indexpage");
getData();

initSocket(http);

http.listen(5000, () => {
  console.log("Socket.IO running on port 5000");
});
