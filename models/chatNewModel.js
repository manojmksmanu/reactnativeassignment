const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  chatId: { type: String, unique: true, required: true },
  users: [
    {
      user: { type: mongoose.Types.ObjectId, required: true },
      userType: {
        type: String,
        required: true,
        refPath: "users.refModel",
      }, // Store the model name here
      refModel: {
        type: String,
        required: true,
        enum: ["Admin", "Student", "Tutor"], // Ensures the value is valid
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Add the refPath to the schema, referencing the refModel field
chatSchema.path("users.user").options.refPath = "users.refModel";

// Create the Chat model
const ChatNew = mongoose.model("ChatNew", chatSchema);

module.exports = ChatNew;
