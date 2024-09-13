const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://Manoj4753:Manoj4753@mymegaminds.76midbs.mongodb.net/test1?retryWrites=true&w=majority&appName=Mymegaminds"
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
