import nodemailer from 'nodemailer';
import catchAsync from './catchAsync.js';
import AppError from './AppError.js';

export const emailUtility = catchAsync(async (options,next) => {
    const { to, subject, text, html } = options;

    // Basic validation for required fields
    if (!to || !subject || (!text && !html)) {
        next(new AppError('Recipient email, subject, and content are required', 400));
    }

    // Set up the nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
    };

    // Send email
    await transporter.sendMail(mailOptions);
});
