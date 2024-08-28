// const { io } = require("../index");
const Message = require("../models/messageModel");
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
    // Log the new message for debugging
    console.log(newMessage, "New message created successfully");
    // Send success response
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
  // const chatUser = await Message.findById(chatId);

  // if (!chatUser) {
  //   return res.status(404).json({ message: "User not found" });
  // }

  // if (user.isAdmin || chatUser.isAdmin) {
  //   const messages = await Message.find({
  //     $or: [
  //       { sender: user._id, receiver: chatUserId },
  //       { sender: chatUserId, receiver: user._id },
  //     ],
  //   })
  //     .populate("sender", "username")
  //     .populate("receiver", "username");

  //     res.json(messages);
  //   } else {
  //     res.status(403).json({ message: "Not authorized to see these messages" });
  //   }
  // } catch (error) {
  //   res.status(500).json({ message: "Server Error" });
  // }
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
      console.log(admins);
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.forwardMessages = async (req, res) => {
  const { chatId, messages } = req.body;

  try {
    const newMessages = await Promise.all(
      messages.map(async (msg) => {
        const newMessage = new Message({
          chatId,
          sender: msg.sender,
          senderName: msg.senderName,
          message: msg.message,
          replyingMessage: "",
          createdAt: new Date(),
        });

        await newMessage.save();
        return newMessage;
      })
    );
    // const forwardSocket=(io)=>{
    //   io.to(chatId).emit("newMessage", newMessages);
    // }

    // Emit event to other clients

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
