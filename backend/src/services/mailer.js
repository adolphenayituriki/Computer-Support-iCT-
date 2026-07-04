import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
});

export async function sendResetEmail(toEmail, token) {
  console.log(`Attempting to send reset email to ${toEmail} via ${process.env.ADMIN_EMAIL}`);
  await transporter.sendMail({
    from: `"CS Hub (iCT)" <${process.env.ADMIN_EMAIL}>`,
    to: toEmail,
    subject: 'Password Reset Code — CS Hub (iCT)',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0f172a; border-radius: 12px; color: #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 1.5rem; font-weight: 800; color: #ffce08;">CS H</span><span style="font-size: 1.5rem; font-weight: 300; color: #ffce08;">ub</span>
          <span style="font-size: 1.5rem; font-weight: 300; color: #ffce08;">(</span><span style="font-size: 1.5rem; font-weight: 300; color: #38bdf8;">iCT</span><span style="font-size: 1.5rem; font-weight: 300; color: #ffce08;">)</span>
          <div style="font-size: 0.7rem; color: #94a3b8; letter-spacing: 2px;">COMPUTER SUPPORT</div>
        </div>
        <h2 style="color: #f8fafc; text-align: center;">Reset Password</h2>
        <p style="color: #cbd5e1; text-align: center;">
          A reset code was generated for <strong style="color:#f8fafc;">${toEmail}</strong>. Use it below.
        </p>
        <div style="margin: 20px 0;">
          <div style="background: #1e293b; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 12px;">
            <span style="font-size: 2rem; font-weight: 800; letter-spacing: 6px; color: #ffce08;">${token}</span>
          </div>
          <p style="color: #94a3b8; font-size: 0.85rem; text-align: center;">
            Use this code to reset your password.
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 0.85rem; text-align: center;">
          <a href="https://computer-support-ict.vercel.app/" style="color: #38bdf8; text-decoration: none;">Reset Password</a>
        </p>
        <p style="color: #64748b; font-size: 0.8rem; text-align: center;">
          <a href="https://computer-support-ict.vercel.app/signin" style="color: #64748b; text-decoration: underline;">Back to Sign In</a>
        </p>
        <hr style="border: none; border-top: 1px solid #1e293b; margin: 20px 0;" />
        <p style="color: #475569; font-size: 0.75rem; text-align: center;">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
