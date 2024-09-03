const { Server } = require("socket.io");
const Message = require("../models/messageModel");

let io;
let onlineUsers = [];
function initSocket(server) {
  io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user is connected to", socket.id);
    // Initialize onlineUsers as an empty array

    // Listen for 'userOnline' event
    socket.on("userOnline", (userId) => {
      console.log(userId, "userId");
      // Check if the user is already in the onlineUsers array
      if (!onlineUsers.some((user) => user.userId === userId)) {
        // If not, add the user to the onlineUsers array
        onlineUsers.push({ userId, socketId: socket.id });
      }
      console.log("onlineUsers", onlineUsers);
      // Emit the updated onlineUsers array to all connected clients
      io.emit("getOnlineUsers", onlineUsers);
    });
    // Listen for user joining with their userId ends here

    socket.on("joinRoom", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined room ${chatId}`);
    });

    socket.on("sendMessage", async (messageData) => {
      console.log(messageData, "hskdjfhdsjkhfsdfs");
      try {
        const { sender, message, replyingMessage, senderName, chatId } =
          messageData;
        // Emit message to the specific room
        io.to(chatId).emit("receiveMessage", messageData);
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
    // Handle user disconnect
    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      io.emit("getOnlineUsers", onlineUsers);
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
