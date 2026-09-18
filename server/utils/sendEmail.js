import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log(`[Email Simulation] To: ${options.email} | Subject: ${options.subject}`);
    console.log(`[Email Body]:\n${options.message || options.html}`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'LearnHub LMS <noreply@learnhub.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
  return true;
};
