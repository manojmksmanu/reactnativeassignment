const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      // "mongodb://localhost:27017"
      "mongodb+srv://Manoj4753:Manoj4753@mymegaminds.76midbs.mongodb.net/test1?retryWrites=true&w=majority&appName=Mymegaminds"
      // "mongodb+srv://manoj2022019:7gxePcOGu7SnvvVL@nativechat.unnjx.mongodb.net/chatDB?retryWrites=true&w=majority&appName=nativechat"
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
