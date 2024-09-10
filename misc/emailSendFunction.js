const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, verificationLink) => {
  try {
    console.log("verificationemail generator");

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "manojforwork2022@gmail.com",
        pass: "manoj@for@work@2024", // Ideally, use environment variables for security
      },
    });

    console.log("1");

    const mailOptions = {
      from: "manojforwork2022@gmail.com",
      to: email,
      subject: "Verify your email",
      html: `<p>Click the following link to verify your account:</p>
             <a href="${verificationLink}">Verify Email</a>`,
    };

    console.log("2");
    // Await the result of sendMail
    await transporter.sendMail(mailOptions);
    console.log("final");
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

module.exports = sendVerificationEmail;
