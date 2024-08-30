const { Server } = require("socket.io");
const Message = require("../models/messageModel");

let io;

function initSocket(server) {
  io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user is connected", socket.id);

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

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
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
