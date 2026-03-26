const sendEmail = async (to, subject, text, htmlContent) => {
  try {
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

    console.log("Email sent to", to);  // ← add this
  } catch (err) {
    console.error("sendEmail error:", err.message);  // ← add this
  }
};