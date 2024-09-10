const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, verificationLink) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Verify your email",
    html: `<p>Click the following link to verify your account:</p>
           <a href="${verificationLink}">Verify Email</a>`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
