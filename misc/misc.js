const Chat = require("../models/chatModel");

// exports.createChatId = (user1, user2) => {
//   // Ensure that the chatId is always the same regardless of the order of the users
//   return user1._id < user2._id
//     ? `${user1._id}-${user2._id}`
//     : `${user2._id}-${user1._id}`;
// };
exports.createChatId = (user1, user2) => {
  // Ensure that the chatId is always the same regardless of the order of the users
  return user1._id < user2._id
    ? `${user1._id}-${user2._id}`
    : `${user2._id}-${user1._id}`;
};

exports.getChatsForUser = async (userId) => {
  const chats = await Chat.find({ users: userId })
    .populate("users", "-password")
    .sort({ updatedAt: -1 });
  return chats;
};

exports.getRefPath = async (userType) => {
  console.log("Received userType:", userType); // Debugging line
  let refModel;
  switch (userType) {
    case "Admin":
    case "Super-Admin":
    case "Co-Admin":
    case "Sub-Admin":
      refModel = "Admin";
      break;
    case "Student":
      refModel = "Student";
      break;
    case "Tutor":
      refModel = "Tutor";
      break;
    default:
      throw new Error("Unknown userType");
  }
  console.log(refModel, "ref", userType); // Debugging line
  return refModel;
};
