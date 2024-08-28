const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user is connected", socket.id);

    socket.on("sendMessage", async (messageData) => {
      console.log(messageData,'hskdjfhdsjkhfsdfs');
      try {
        const { sender, message, replyingMessage, senderName, chatId } =
          messageData;
        // Emit message to the specific receiver
        socket.emit("receiveMessage", messageData);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("forwardMessage", async (messageData) => {
      console.log(messageData);
      socket.emit("forwardR", messageData);
    });

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
