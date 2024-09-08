const Admin = require("../models/adminModel");
const NewChat = require("../models/newChatModel");
const Student = require("../models/studentModel");
const Tutor = require("../models/tutorModel");
const { deleteChatsForDeletedUsers } = require("./deleteChat");

exports.createChatId = (user1, user2) => {
  // Ensure that the chatId is always the same regardless of the order of the users
  return user1._id < user2._id
    ? `${user1._id}-${user2._id}`
    : `${user2._id}-${user1._id}`;
};

exports.getChatsForUser = async (userId) => {
  try {
    const chats = await NewChat.find({ "users.user": userId })
      .populate({
        path: "users.user",
        select: "-password",
      })
      .populate({
        path: "latestMessage",
        model: "Message",
      })
      .sort({ updatedAt: -1 });
    console.log("updated");

    await deleteChatsForDeletedUsers();
    return chats;
  } catch (error) {
    console.error("Error fetching chats for user:", error);
    throw error;
  }
};

exports.findUserById = async ({ userId }) => {
  let user;

  // Check in Student model
  user = await Student.findById(userId).select("-password");

  if (user) return user;

  // Check in Tutor model
  user = await Tutor.findById(userId).select("-password");
  if (user) return user;

  // Check in Admin model
  user = await Admin.findById(userId).select("-password");
  if (user) return user;

  // If no user found in any of the models
  return null;
};
