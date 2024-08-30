const Admin = require("../models/adminModel");
const ChatNew = require("../models/chatNewModel");
const Student = require("../models/studentModel");
const Tutor = require("../models/tutorModel");
const { createChatId } = require("./misc");

const chatPermissions = {
  Admin: ["Super-Admin", "Sub-Admin", "Co-Admin", "Student", "Tutor"],
  "Super-Admin": ["Admin", "Sub-Admin", "Co-Admin", "Student", "Tutor"],
  "Sub-Admin": ["Super-Admin", "Admin", "Student"],
  "Co-Admin": ["Super-Admin", "Admin", "Tutor"],
  Tutor: ["Super-Admin", "Admin", "Co-Admin"],
  Student: ["Super-Admin", "Admin", "Sub-Admin"],
};

getAllUsersForChatCreation = async () => {
  const admins = await Admin.find({});
  const tutors = await Tutor.find({});
  const students = await Student.find({});

  return [
    ...admins.map((admin) => ({
      _id: admin._id,
      userType: admin.userType,
    })),
    ...tutors.map((tutor) => ({
      _id: tutor._id,
      userType: tutor.userType,
    })),
    ...students.map((student) => ({
      _id: student._id,
      userType: student.userType,
    })),
  ];
};

async function populateAllChats() {
  const chats = await ChatNew.findById({
    _id: "66d1ba758f669d11e1920a81",
  })
    .populate("users.user")
    .exec();
  return chats;
}

const rundata = async () => {
  const data = await populateAllChats();
  console.log(data.users);
};

rundata();

exports.createChatsForAllUsers = async () => {
  try {
    const users = await getAllUsersForChatCreation();

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const user1 = users[i];
        const user2 = users[j];

        // Check if user1 is allowed to chat with user2
        if (chatPermissions[user1.userType]?.includes(user2.userType)) {
          // Check if a chat already exists between these users
          const existingChat = await ChatNew.findOne({
            $and: [{ "users.user": user1._id }, { "users.user": user2._id }],
          });

          const chatId = createChatId(user1, user2);
          // If no existing chat, create a new one
          if (!existingChat) {
            const refModel1 = [
              "Admin",
              "Super-Admin",
              "Sub-Admin",
              "Co-Admin",
            ].includes(user1.userType)
              ? "Admin"
              : user1.userType;
            const refModel2 = [
              "Admin",
              "Super-Admin",
              "Sub-Admin",
              "Co-Admin",
            ].includes(user1.userType)
              ? "Admin"
              : user2.userType;
            console.log(refModel1, refModel2);
            const chatBetween = `Created chat between ${user1.userType} (${user1.name}) and ${user2.userType} (${user2.name})`;
            const newChat = new ChatNew({
              chatId: chatId,
              chatBetween: chatBetween,
              users: [
                {
                  user: user1._id,
                  userType: user1.userType, // Assign userType for user1
                  refModel: refModel1, // Assign refModel for user1
                },
                {
                  user: user2._id,
                  userType: user2.userType, // Assign userType for user2
                  refModel: refModel2, // Assign refModel for user2
                },
              ],
            });

            await newChat.save();
            console.log(
              `Created chat between ${user1.userType} (${user1._id}) and ${user2.userType} (${user2._id})`
            );
          } else {
            console.log(
              `Chat already exists between ${user1.userType} (${user1._id}) and ${user2.userType} (${user2._id})`
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Error creating chats:", error);
  }
};
