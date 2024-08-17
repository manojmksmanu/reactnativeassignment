const Message = require("../models/messageModel");
const User = require("../models/userModel");

// Send message
exports.sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;

  try {
    // Check if the sender is an admin or if the receiver is the admin
    const sender = req.user;
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (sender.isAdmin || receiver.isAdmin) {
      const newMessage = await Message.create({
        sender: sender._id,
        receiver: receiverId,
        message,
      });

      res.status(201).json(newMessage);
    } else {
      res.status(403).json({ message: "Not authorized to send messages" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get messages
exports.getMessages = async (req, res) => {
  const { chatUserId } = req.params;

  try {
    // Check if the user is allowed to see the chat
    const user = req.user;
    const chatUser = await User.findById(chatUserId);

    if (!chatUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isAdmin || chatUser.isAdmin) {
      const messages = await Message.find({
        $or: [
          { sender: user._id, receiver: chatUserId },
          { sender: chatUserId, receiver: user._id },
        ],
      })
        .populate("sender", "username")
        .populate("receiver", "username");

      res.json(messages);
    } else {
      res.status(403).json({ message: "Not authorized to see these messages" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all users (only for admin)
// Get users (admins get all, normal users get only admins, exclude current user)
exports.getUsers = async (req, res) => {
  try {
    const user = req.user;

    if (user.isAdmin) {
      // Admins can see all users except themselves
      const users = await User.find({ _id: { $ne: user._id } }).select('-password');
      res.json(users);
    } else {
      // Normal users can only see admins except themselves
      const admins = await User.find({ isAdmin: true, _id: { $ne: user._id } }).select('-password');
      res.json(admins);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


