// userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true }, // This is the discriminator key
    phoneNumber: { type: String },
    phoneCountry: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
  },
  { timestamps: true }
);

const UserTest = mongoose.model("UserTest", userSchema);

module.exports = UserTest;
