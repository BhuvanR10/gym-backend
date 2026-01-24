const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("❌ Email transporter error:", err);
  } else {
    console.log("✅ Email transporter ready");
  }
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Fitness Empire" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };
