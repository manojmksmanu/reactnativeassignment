const Chat = require("../models/chatModel");

exports.createChatId = (user1, user2) => {
  // Ensure that the chatId is always the same regardless of the order of the users
  return user1._id < user2._id
    ? `${user1._id}-${user2._id}`
    : `${user2._id}-${user1._id}`;
};

exports.getChatsForUser = async (userId) => {
  return await Chat.find({ users: userId }).populate({path: 'users',
        select: '-password' });
};