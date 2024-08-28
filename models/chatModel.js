const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
  chatId: { type: String, unique: true, required: true },
  users: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
  // latestMessage: { type: mongoose.Schema.Types.Mixed },
  //   messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});

// Create the Chat model
const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
