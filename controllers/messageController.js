// const { io } = require("../index");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const NewChat = require("../models/newChatModel");
const User = require("../models/userModel");

// Send message
exports.sendMessage = async (req, res) => {
  const { chatId, sender, senderName, message, messageId, replyingMessage } =
    req.body;
  try {
    const newMessage = await Message.create({
      chatId,
      sender,
      senderName,
      message,
      messageId,
      replyingMessage,
    });
    // Update the latest message in the chat
    await NewChat.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id,
    });
    res
      .status(201)
      .json({ message: "Message created successfully", newMessage });
  } catch (error) {
    // Log the error for debugging
    console.error("Error creating message:", error);

    // Send error response
    res.status(500).json({ message: "Server Error" });
  }
};

// Get messages
exports.getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chatId: chatId })
      .populate("sender", "name pic email")
      .populate("chatId");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// Get all users (only for admin)
// Get users (admins get all, normal users get only admins, exclude current user)
exports.getUsers = async (req, res) => {
  try {
    const user = req.user;

    if (user.isAdmin) {
      // Admins can see all users except themselves
      const users = await User.find({ _id: { $ne: user._id } }).select(
        "-password"
      );
      res.json(users);
    } else {
      // Normal users can only see admins except themselves
      const admins = await User.find({
        isAdmin: true,
        _id: { $ne: user._id },
      }).select("-password");
      res.json(admins);
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.forwardMessages = async (req, res) => {
  const { chatId, messages, loggedUserId, loggedUserName } = req.body;
  try {
    const newMessages = await Promise.all(
      messages.map(async (msg) => {
        const newMessage = new Message({
          chatId,
          sender: loggedUserId,
          senderName: loggedUserName,
          message: msg.message,
          replyingMessage: "",
          createdAt: new Date(),
        });
        await newMessage.save();
        return newMessage;
      })
    );
    res
      .status(201)
      .json({ message: "Messages forwarded successfully", newMessages });
  } catch (error) {
    console.error("Failed to forward messages:", error);
    res
      .status(500)
      .json({ error: "Failed to forward messages", details: error.message });
  }
};
