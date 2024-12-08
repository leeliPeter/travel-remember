import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL;

const emailTemplate = (content: string) => `
  <div style="
    background-color: #f9fafb;
    padding: 40px 0;
    font-family: 'Arial', sans-serif;
  ">
    <div style="
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    ">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="
          color: #1a1a1a;
          font-size: 24px;
          margin: 0;
          padding: 0;
        ">Plan Travel</h1>
      </div>
      ${content}
      <div style="
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eaeaea;
        text-align: center;
        color: #666;
        font-size: 12px;
      ">
        <p>This email was sent from Plan Travel. Please do not reply to this email.</p>
      </div>
    </div>
  </div>
`;

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const content = `
    <div style="text-align: center; padding: 20px;">
      <h2 style="color: #374151; font-size: 20px; margin-bottom: 16px;">
        Your Two-Factor Authentication Code
      </h2>
      <div style="
        background-color: #f3f4f6;
        padding: 16px;
        border-radius: 8px;
        margin: 20px 0;
      ">
        <span style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #1a1a1a;
        ">${token}</span>
      </div>
      <p style="color: #6b7280; margin-top: 16px;">
        This code will expire in 5 minutes. Do not share this code with anyone.
      </p>
    </div>
  `;

  await resend.emails.send({
    from: "Mail@theplantravel.com",
    to: email,
    subject: "Your 2FA Code - Plan Travel",
    html: emailTemplate(content),
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;
  const content = `
    <div style="text-align: center; padding: 20px;">
      <h2 style="color: #374151; font-size: 20px; margin-bottom: 16px;">
        Reset Your Password
      </h2>
      <p style="color: #6b7280; margin-bottom: 24px;">
        Click the button below to reset your password. This link will expire in 1 hour.
      </p>
      <a href="${resetLink}" style="
        display: inline-block;
        background-color: #3b82f6;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
      ">Reset Password</a>
      <p style="color: #6b7280; margin-top: 24px; font-size: 14px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  await resend.emails.send({
    from: "Mail@theplantravel.com",
    to: email,
    subject: "Reset Your Password - Plan Travel",
    html: emailTemplate(content),
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  const content = `
    <div style="text-align: center; padding: 20px;">
      <h2 style="color: #374151; font-size: 20px; margin-bottom: 16px;">
        Verify Your Email Address
      </h2>
      <p style="color: #6b7280; margin-bottom: 24px;">
        Thanks for signing up! Please verify your email address to complete your registration.
      </p>
      <a href="${confirmLink}" style="
        display: inline-block;
        background-color: #3b82f6;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
      ">Verify Email</a>
      <p style="color: #6b7280; margin-top: 24px; font-size: 14px;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `;

  await resend.emails.send({
    from: "Mail@theplantravel.com",
    to: email,
    subject: "Verify Your Email - Plan Travel",
    html: emailTemplate(content),
  });
};
