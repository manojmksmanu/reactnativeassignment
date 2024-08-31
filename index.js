const express = require("express");
// const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Message = require("./models/messageModel");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatMessageRoutes");
const cors = require("cors");
const { initSocket } = require("./socket/socket");
const {
  getAllUsersForChatCreation,
  createChatsForAllUsers,
} = require("./misc/createChats");
const ChatNew = require("./models/newChatModel");
const { deleteChatsForDeletedUsers } = require("./misc/deleteChat");

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
app.use("/api/chat", chatRoutes);

const http = require("http").createServer(app);
const getData = async () => {
  // const data = await getAllUsersForChatCreation();
  await deleteChatsForDeletedUsers();

  const data = await createChatsForAllUsers();
};

getData();

initSocket(http);

http.listen(5000, () => {
  console.log("Socket.IO running on port 5000");
});
