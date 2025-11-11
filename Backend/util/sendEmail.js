import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const sendOtp = async (email, otp, type = 'signup') => {
    const subject =
        type === 'reset'
            ? "Reset Your Password - RMG Septic Cleaning Services"
            : "Verify Your Email - RMG Septic Cleaning Services";

    const message =
        type === 'reset'
            ? `We received a request to reset your password. To proceed with resetting your password, please use the verification code below.`
            : `Thank you for choosing RMG Septic Cleaning Services! To complete your registration and secure your account, please verify your email address using the code below.`;

    const label = type === 'reset' ? 'Password Reset Code' : 'Verification Code';

    const htmlMessage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                                RMG Septic Cleaning Services
                            </h1>
                            <p style="margin: 8px 0 0 0; color: #e2e8f0; font-size: 14px; font-weight: 400;">
                                Professional • Reliable • Affordable
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 22px; font-weight: 600;">
                                ${type === 'reset' ? 'Password Reset Request' : 'Email Verification Required'}
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                ${message}
                            </p>

                            <!-- OTP Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td style="background-color: #f7fafc; border: 2px dashed #cbd5e0; border-radius: 8px; padding: 30px; text-align: center;">
                                        <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                                            ${label}
                                        </p>
                                        <p style="margin: 0; color: #2d3748; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                            ${otp}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                           <!-- Go Back to Website -->
<div style="background-color: #edf2ff; border-left: 4px solid #4f46e5; padding: 16px 20px; border-radius: 4px; margin: 25px 0;">
    <p style="margin: 0; color: #1e3a8a; font-size: 14px; font-weight: 600;">
        ✅ Next Step
    </p>
    <p style="margin: 8px 0 0 0; font-size: 14px; color: #1e40af;">
        After receiving this code, you can <a href="https://yourwebsite.com" target="_blank" style="color: #1e40af; text-decoration: underline; font-weight: 600;">go back to our website</a> to continue.
    </p>
</div>

<!-- Important Information -->
<div style="background-color: #fffaf0; border-left: 4px solid #ed8936; padding: 16px 20px; border-radius: 4px; margin: 25px 0;">
    <p style="margin: 0 0 10px 0; color: #744210; font-size: 14px; font-weight: 600;">
        ⚠️ Important Information
    </p>
    <ul style="margin: 0; padding-left: 20px; color: #975a16; font-size: 14px; line-height: 1.6;">
        <li style="margin-bottom: 6px;">This verification code will expire in <strong>10 minutes</strong></li>
        <li style="margin-bottom: 6px;">Never share this code with anyone, including our staff</li>
        <li>If you didn't request this code, please ignore this email or contact us immediately</li>
    </ul>
</div>


                            <p style="margin: 25px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                If you have any questions or need assistance, please don't hesitate to reach out to our support team.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 14px; font-weight: 600;">
                                RMG Septic Cleaning Services
                            </p>
                            <p style="margin: 0 0 15px 0; color: #718096; font-size: 13px; line-height: 1.5;">
                                Providing quality septic cleaning and maintenance services
                            </p>
                            <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                © ${new Date().getFullYear()} RMG Septic Cleaning Services. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Bottom spacing -->
                <table role="presentation" style="max-width: 600px; width: 100%; margin-top: 20px;">
                    <tr>
                        <td style="text-align: center; padding: 0 30px;">
                            <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.5;">
                                This is an automated message, please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const plainTextMessage = `
RMG SEPTIC CLEANING SERVICES
Professional • Reliable • Affordable
========================================

${type === 'reset' ? 'PASSWORD RESET REQUEST' : 'EMAIL VERIFICATION REQUIRED'}

${message}

${label}: ${otp}

IMPORTANT INFORMATION:
⚠ This verification code will expire in 10 minutes
⚠ Never share this code with anyone, including our staff
⚠ If you didn't request this code, please ignore this email or contact us immediately

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

========================================
RMG Septic Cleaning Services
Providing quality septic cleaning and maintenance services

© ${new Date().getFullYear()} RMG Septic Cleaning Services. All rights reserved.

This is an automated message, please do not reply to this email.
    `;

    await transporter.sendMail({
        from: `"RMG Septic Cleaning Services" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        text: plainTextMessage,
        html: htmlMessage
    });
};