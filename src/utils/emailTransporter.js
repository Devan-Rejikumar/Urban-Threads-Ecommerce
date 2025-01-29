import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const createTransporter = async () => {
    try {
        console.log('Setting up email transporter with user:', process.env.EMAIL_USER);

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('No email credentials found, creating test account...');
            const testAccount = await nodemailer.createTestAccount();

            return nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                }
            });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            debug: true,
            logger: true
        });

        console.log('Verifying transporter configuration...');
        await transporter.verify();
        console.log('Transporter verified successfully');
        return transporter;
    } catch (error) {
        console.error('Email transporter configuration error:', error);
        throw new Error(`Failed to configure email transport: ${error.message}`);
    }
};