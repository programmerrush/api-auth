// src/services/emailService.js
const nodemailer = require("nodemailer");

const EMAIL_ADDRESS = "elixir.iotproducts@gmail.com";
const EMAIL_PASSWORD = "gvbw axrs vkxd pxal";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: EMAIL_ADDRESS,
    pass: EMAIL_PASSWORD,
  },
});

async function sendResetEmail(to, code, token) {
  const mailOptions = {
    from: `3Phase API <${EMAIL_ADDRESS}>`,
    to,
    subject: "Password Reset Request",
    text: `Your password reset code is: ${code}\n\nUse it to reset your password.\nIf you did not request this, please ignore this email.`,
  };
  //   \nYour password reset token is: ${token}
  return transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };
