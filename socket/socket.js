const { Server } = require("socket.io");
const Message = require("../models/messageModel");

let io;
let onlineUsers = [];
console.log(onlineUsers)
function initSocket(server) {
  io = new Server(server);

  io.on("connection", (socket) => {
    console.log(onlineUsers,'connection')
    console.log("a user is connected to", socket.id);
    // Initialize onlineUsers as an empty array

    // Listen for 'userOnline' event
    socket.on("userOnline", (userId) => {
      if (!onlineUsers.some((user) => user.userId === userId)) {
        onlineUsers.push({ userId, socketId: socket.id });
      }
      console.log(onlineUsers, "online");
      io.emit("getOnlineUsers", onlineUsers);
    });

    socket.on("joinRoom", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined room ${chatId}`);
    });

    socket.on("sendMessage", async (messageData) => {
      console.log("sendMessage event received:", messageData);
      try {
        const { sender, message, replyingMessage, senderName, chatId } =
          messageData;
        // Emit message to the specific room
        io.to(chatId).emit("receiveMessage", messageData);
        console.log("Message emitted to chatId:", chatId);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on(
      "forwardMessage",
      async ({ chatId, messages, loggedUserId, loggedUserName }) => {
        console.log(
          chatId,
          "chatId",
          messages,
          "messages",
          loggedUserId,
          "loggedUserId",
          loggedUserName,
          "loggedUsernae"
        );
        try {
          const newMessages = await Promise.all(
            messages.map(async (msg) => {
              const newMessage = new Message({
                chatId: chatId,
                sender: loggedUserId,
                senderName: loggedUserName,
                message: msg.message,
                replyingMessage: "",
                createdAt: new Date(),
              });
              return newMessage;
            })
          );
          console.log(newMessages, "socketworking");
          // Emit event to other clients
          io.to(chatId).emit("forwarMessageReceived", newMessages);
        } catch (error) {
          console.log(error);
        }
      }
    );

    // Handle logout event
    socket.on("logout", (userId) => {
      onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
      console.log(onlineUsers, "👌👌👌👌👌👌👌👌👌👌");
      io.emit("getOnlineUsers", onlineUsers);
    });
    // Handle user disconnect
    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      console.log(onlineUsers,'disconnect')
      io.emit("getOnlineUsers", onlineUsers);
      console.log("A user disconnected:", socket.id);
    });
  });

  return io;
}

function getSocketInstance() {
  if (!io) {
    throw new Error("Socket.io not initialized! Call initSocket first.");
  }
  return io;
}

module.exports = { initSocket, getSocketInstance };
