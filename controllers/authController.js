const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, "your_jwt_secret", {
    expiresIn: "30d",
  });
};

exports.signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, password });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Controller function to get the logged user details
exports.getLoggedUser = async (req, res) => {
  try {
    const user = req.user;
    console.log(user, 'user');

    // Use findOne instead of find to get a single user document
    const loggedUser = await User.findOne({
      _id: user._id,
    }).select("-password"); // Exclude the password field

    if (!loggedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(loggedUser);
    console.log(loggedUser);
  } catch (error) {
    console.error('Error fetching logged user:', error);
    res.status(500).json({ message: "Server Error" });
  }
};