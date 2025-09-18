import nodemailer from "nodemailer";

export const sendResetEmail = async (toEmail, resetUrl) => {
  // Configure transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Email message options
  const mailOptions = {
    from: `"CodeNest Support" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Password Reset Request",
    text: `You requested a password reset. Please open the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `<p>You requested a password reset. Please click the link below to reset your password:</p>
           <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
           <p>If you did not request this, you can safely ignore this email.</p>`
  };

  // Send email
  await transporter.sendMail(mailOptions);
};
