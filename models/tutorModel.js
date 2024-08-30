const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserTest = require("./user");

const tutorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true, enum: ["Tutor"] },
    whatsappNumber: { type: String },
    whatsappCountry: { type: mongoose.Schema.Types.ObjectId, ref: "Country" },
    phoneNumber: { type: String, required: true },
    phoneCountry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    onlineStatus: { type: Boolean, default: false },
    isReviewed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isIpaApproved: { type: Boolean, default: false },
    subjects: [{ type: String }],
    verifiedSubjects: [
      {
        name: { type: String },
        verified: { type: Boolean, default: false },
      },
    ],
    expoPushToken: { type: String, default: "" },
  },
  { timestamps: true }
);

tutorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

tutorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Tutor = mongoose.model("Tutor", tutorSchema);
// const Tutor = UserTest.discriminator("Tutor", tutorSchema);
module.exports = Tutor;
