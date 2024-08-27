const Chat = require("../models/chatModel");

exports.createChatId = (user1, user2) => {
  // Ensure that the chatId is always the same regardless of the order of the users
  return user1._id < user2._id
    ? `${user1._id}-${user2._id}`
    : `${user2._id}-${user1._id}`;
};

exports.getChatsForUser = async (userId) => {
  const chats = await Chat.find({ users: userId }).populate({
    path: "users",
    select: "-password",
  });
  return chats;
  //   return chats.map((chat) => ({
  //     _id: chat._id,
  //     chatId: chat.chatId,
  //     createdAt: chat.createdAt,
  //     users: chat.users.map((user) => ({
  //       _id: user._id,
  //       username: user.username,
  //       isAdmin: user.isAdmin,
  //     })),
  //   }));
};
