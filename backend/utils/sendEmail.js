const nodemailer = require('nodemailer');

// Sends transactional email (password resets, notifications). Falls back to a console
// log in development if SMTP credentials are not configured, so the app still runs.
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('--- EMAIL (SMTP not configured, logging instead) ---');
    console.log({ to, subject, html });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
