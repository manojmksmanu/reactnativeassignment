const express = require("express");
// const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Message= require('./models/messageModel')
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const cors = require("cors");


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

const io = require("socket.io")(http);

io.on("connection", (socket) => {
  console.log("a user is connected", socket.id);
   socket.on("sendMessage", async (messageData) => {
    console.log(messageData)
     try {
       const { sender, receiver, message } = messageData;

       // Save message to database
       const newMessage = new Message({
         sender,
         receiver,
         message,
       });
       await newMessage.save();

       // Emit message to the receiver
         io.emit("receiveMessage", messageData);
       console.log(messageData,'messaage')
     } catch (error) {
       console.error("Error saving message:", error);
     }
   });

   socket.on("disconnect", () => {
     console.log("User disconnected", socket.id);
   });
});

http.listen(5000, () => {
  console.log("Socket.IO running on port 5000");
});
