import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text, htmlContent) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"BIKEONRENT 🚴" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: text,
    html: htmlContent
  });

};

export default sendEmail;