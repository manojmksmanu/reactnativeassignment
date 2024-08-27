const { createChatId } = require("../misc/misc");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// exports.createChatsForNewUser = async (newUser) => {
//   const allUsers = await User.find({ _id: { $ne: newUser._id } });
//   allUsers.forEach(async (existingUser) => {
//     const chatId = createChatId(newUser, existingUser);
//     const chatExists = await Chat.findOne({ chatId });
//     if (!chatExists) {
//       const newChat = new Chat({
//         chatId: chatId,
//         users: [newUser._id, existingUser._id],
//         messages: [],
//       });
//       await newChat.save();
//     }
//   });
// };

exports.createChatsForNewUser = async (newUser) => {
  try {
    // Fetch all existing users from the database
    const allUsers = await User.find({ _id: { $ne: newUser._id } });
    allUsers.forEach(async (existingUser) => {
      if (newUser.isAdmin) {
        const chatId = createChatId(newUser, existingUser);
        const chatExists = await Chat.findOne({ chatId });
        if (!chatExists) {
          const newChat = new Chat({
            chatId: chatId,
            users: [newUser._id, existingUser._id],
            messages: [],
          });
          await newChat.save();
        }
      }
      if (!newUser.Admin && existingUser.isAdmin) {
        const chatId = createChatId(newUser, existingUser);
        const chatExists = await Chat.findOne({ chatId });
        if (!chatExists) {
          const newChat = new Chat({
            chatId: chatId,
            users: [newUser._id, existingUser._id],
            messages: [],
          });
          await newChat.save();
        }
      }
    });
  } catch (error) {
    console.error("Error creating chats for new user:", error);
  }
};
