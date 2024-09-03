const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const Student = require("../models/studentModel");
const Tutor = require("../models/tutorModel");
const { findUserById } = require("../misc/misc");

const generateToken = (id) => {
  return jwt.sign({ id }, "your_jwt_secret", {
    expiresIn: "30d",
  });
};

exports.signup = async (req, res) => {
  const { name, email, password, userType } = req.body;
  console.log(name, email, password, userType);
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ name, email, password, userType });
;
    // await createChatsForNewUser(user);
    // res.status(201).json({
    //   _id: user._id,
    //   username: user.username,
    //   isAdmin: user.isAdmin,
    // });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// exports.login = async (req, res) => {
//   const { name, password } = req.body;
//   try {
//     const user = await User.findOne({ username });
//     if (user && (await user.matchPassword(password))) {
//       res.json({
//         _id: user._id,
//         username: user.username,
//         isAdmin: user.isAdmin,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(401).json({ message: "Invalid credentials" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Server Error" });
//   }
// };
exports.login = async (req, res) => {
  const { email,userType, password,  } = req.body;
  if (userType === "Admin") {
    try {
      const user = await Admin.findOne({ email });
    
      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user._id,
          name: user.name,
          isAdmin: user.userType,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  }

  if (userType === "Student") {
    try {
      const user = await Student.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user._id,
          name: user.name,
          isAdmin: user.userType,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  }

  if (userType === "Tutor") {
    try {
      const user = await Tutor.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user._id,
          name: user.name,
          isAdmin: user.userType,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  }

  // if (userType !== "Tutor" || userType !== "Student" || userType !== "Admin") {

  //   res.json("userType does not valied");
  // }
};

// Controller function to get the logged user details
exports.getLoggedUser = async (req, res) => {
  try {
    const user = req.user;
    // Use findOne instead of find to get a single user document
    const loggedUser = await findUserById({ userId: user._id }); // Exclude the password field
    if (!loggedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(loggedUser);
  } catch (error) {
    console.error("Error fetching logged user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
