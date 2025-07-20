const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, subject, body) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: body,
  });
};

module.exports = sendMail;