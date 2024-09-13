const express = require("express");
const connectDB = require("./config/db");
const http = require("http");
const Message = require("./models/MessageModel/messageModel");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/MessageRoutes");
const chatRoutes = require("./routes/chatRoutes");
const countryRoutes = require("./routes/countryRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const cors = require("cors");
const { initSocket } = require("./socket/socket");
const ChatNew = require("./models/NewChatModel/newChatModel");
const { deleteChatsForDeletedUsers } = require("./misc/deleteChat");
const {
  createChatsForAllUsers,
} = require("./controllers/ChatController/chatController");
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

const server = http.createServer(app);
initSocket(server);

app.get("/", (req, res) => {
  res.send("API is running", process.env.MONGO_URI);
});
app.use("/api/auth", authRoutes);
app.use("/api", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/country", countryRoutes);
app.use("/api/subject", subjectRoutes);
console.log(process.env.OTP_SECRET_KEY);

const getData = async () => {
  await deleteChatsForDeletedUsers();
  // const data = await createChatsForAllUsers();
};
console.log("on indexpage");
getData();

server.listen(5000, () => {
  console.log("Socket.IO running on port 5000");
});
