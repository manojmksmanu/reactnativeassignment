const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  senderName: { type: String },
  receiver: {
    type: String,
    required: true,
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replyingMessage: {
    type: Object,
  },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
