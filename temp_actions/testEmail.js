import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendTestEmail = async () => {
  console.log('--- Email Config Debug ---');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_EMAIL);
  console.log('Pass Length:', process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.length : 'MISSING');
  console.log('From:', process.env.FROM_EMAIL);
  console.log('--------------------------');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    debug: true, // show debug output
    logger: true // log information in console
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: 'test@example.com', // This might fail if using Resend free tier and not sending to self, but the login error happens before this usually if credentials are bad. 
    // Wait, if credentials are good but "To" is bad, we get a specific error.
    // I need the user to see the error.
    subject: 'Test Email from ChurchOS',
    text: 'If you receive this, your email configuration is working!',
  };

  try {
    console.log('Attempting to send email...');
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('--- SEND FAILURE ---');
    console.error('Error Code:', error.code);
    console.error('Error Command:', error.command);
    console.error('Error Response:', error.response); 
    console.error('Full Error:', error);
  }
};

sendTestEmail();
