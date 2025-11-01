const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER, // your Gmail
    pass: process.env.SMTP_PASS, // Gmail app password
  },
});

const sendCredentialsEmail = async (to, username, password) => {
  try {
    await transporter.sendMail({
      from: `"Yalgud Dairy" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your Yalgud Dairy Login Credentials",
      html: `
        <h3>Welcome to Yalgud Dairy!</h3>
        <p>Your account has been approved. Here are your login credentials:</p>
        <ul>
          <li><b>Username:</b> ${username}</li>
          <li><b>Password:</b> ${password}</li>
        </ul>
        <p>Please change your password after first login.</p>
      `,
    });
    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

module.exports = sendCredentialsEmail;
