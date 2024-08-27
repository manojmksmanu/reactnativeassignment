const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  sender: { type: String, required: true },
  senderName: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replyingMessage: {
    type: Object,
  },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
