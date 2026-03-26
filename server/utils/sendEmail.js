import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text, htmlContent) => {
  try {
    console.log("Sending email to:", to);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    await transporter.sendMail({
      from: `"BIKEONRENT 🚴" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: htmlContent
    });
    console.log("Email sent successfully");
  } catch (err) {
    console.error("sendEmail FAILED:", err.message);
  }
};

export default sendEmail;