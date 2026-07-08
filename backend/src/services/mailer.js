const BREVO_API = 'https://api.brevo.com/v3/smtp/email';
const BREVO_KEY = process.env.BREVO_API_KEY;
const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.ADMIN_EMAIL;
const fromName = 'CS Hub (iCT)';

function baseHtml(content) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background: #0f172a; border-radius: 14px; color: #e2e8f0;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 1.6rem; font-weight: 800; color: #ffce08;">CS H</span><span style="font-size: 1.6rem; font-weight: 300; color: #ffce08;">ub</span>
        <span style="font-size: 1.6rem; font-weight: 300; color: #ffce08;">(</span><span style="font-size: 1.6rem; font-weight: 300; color: #38bdf8;">iCT</span><span style="font-size: 1.6rem; font-weight: 300; color: #ffce08;">)</span>
        <div style="font-size: 0.65rem; color: #94a3b8; letter-spacing: 2px;">COMPUTER SUPPORT</div>
      </div>
      ${content}
      <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0 16px;" />
      <p style="color: #475569; font-size: 0.75rem; text-align: center; margin: 0;">
        CS Hub (iCT) — Computer Support for All Rwandans
      </p>
    </div>
  `;
}

async function send({ to, subject, html }) {
  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_KEY,
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API ${res.status}: ${err}`);
  }
}

export async function sendResetEmail(toEmail, token) {
  await send({
    to: toEmail,
    subject: 'Password Reset Code — CS Hub (iCT)',
    html: baseHtml(`
      <h2 style="color: #f8fafc; text-align: center; margin: 0 0 8px;">Reset Password</h2>
      <p style="color: #cbd5e1; text-align: center; margin: 0 0 20px;">
        Your reset code for <strong style="color:#f8fafc;">${toEmail}</strong>
      </p>
      <div style="background: #1e293b; border-radius: 10px; padding: 18px; text-align: center; margin-bottom: 16px;">
        <span style="font-size: 2.2rem; font-weight: 800; letter-spacing: 8px; color: #ffce08;">${token}</span>
      </div>
      <p style="color: #94a3b8; font-size: 0.85rem; text-align: center; margin: 0;">
        <a href="https://computer-support-ict.vercel.app/" style="color: #38bdf8;">Reset your password</a>
      </p>
    `),
  });
}

export async function sendTicketConfirmation(toEmail, name, ticket) {
  await send({
    to: toEmail,
    subject: `Ticket Confirmed — ${ticket.title}`,
    html: baseHtml(`
      <h2 style="color: #f8fafc; text-align: center; margin: 0 0 8px;">Support Ticket Confirmed</h2>
      <p style="color: #cbd5e1; text-align: center; margin: 0 0 20px;">Hi <strong style="color:#f8fafc;">${name}</strong>, we have received your request.</p>
      <div style="background: #1e293b; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 6px; color: #94a3b8; font-size: 0.82rem;">Ticket</p>
        <p style="margin: 0 0 4px; color: #f8fafc; font-weight: 700; font-size: 1rem;">${ticket.title}</p>
        <p style="margin: 0; color: #94a3b8; font-size: 0.82rem;">${ticket.category} &middot; ${ticket.status}</p>
      </div>
      <p style="color: #94a3b8; font-size: 0.85rem; text-align: center; margin: 0;">
        Track progress in your <a href="https://computer-support-ict.vercel.app/dashboard" style="color: #38bdf8;">dashboard</a>.
      </p>
    `),
  });
}

export async function sendTicketReplyNotification(toEmail, name, ticket, replyText) {
  await send({
    to: toEmail,
    subject: `New Reply — ${ticket.title}`,
    html: baseHtml(`
      <h2 style="color: #f8fafc; text-align: center; margin: 0 0 8px;">New Reply on Your Ticket</h2>
      <p style="color: #cbd5e1; text-align: center; margin: 0 0 20px;">Hi <strong style="color:#f8fafc;">${name}</strong>, ${ticket.userName !== name ? `an admin replied to` : `you replied on`} <strong style="color:#f8fafc;">${ticket.title}</strong></p>
      <div style="background: #1e293b; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px; color: #cbd5e1; font-style: italic; line-height: 1.5;">"${replyText}"</p>
      </div>
      <p style="color: #94a3b8; font-size: 0.85rem; text-align: center; margin: 0;">
        <a href="https://computer-support-ict.vercel.app/dashboard" style="color: #38bdf8;">View conversation</a>
      </p>
    `),
  });
}

export async function sendTeamStatusUpdate(toEmail, name, status, app) {
  const isApproved = status === 'approved';
  await send({
    to: toEmail,
    subject: `Application ${isApproved ? 'Approved' : 'Updated'} — CS Hub (iCT)`,
    html: baseHtml(`
      <h2 style="color: #f8fafc; text-align: center; margin: 0 0 8px;">Application ${isApproved ? 'Approved' : 'Updated'}</h2>
      <p style="color: #cbd5e1; text-align: center; margin: 0 0 20px;">Hi <strong style="color:#f8fafc;">${name}</strong>, your application status has changed.</p>
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="display: inline-block; padding: 6px 20px; border-radius: 50px; font-weight: 700; font-size: 0.85rem; background: ${isApproved ? '#065f46' : '#991b1b'}; color: ${isApproved ? '#6ee7b7' : '#fca5a5'}; text-transform: uppercase;">${status}</span>
      </div>
      <div style="background: #1e293b; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 4px; color: #cbd5e1;">${app.message?.slice(0, 200)}</p>
      </div>
      ${isApproved ? `<p style="color: #6ee7b7; font-size: 0.9rem; text-align: center; margin: 0 0 8px; font-weight: 600;">Welcome to the team!</p><p style="color: #94a3b8; font-size: 0.85rem; text-align: center; margin: 0;">You can now access team features in your <a href="https://computer-support-ict.vercel.app/dashboard" style="color: #38bdf8;">dashboard</a>.</p>` : `<p style="color: #94a3b8; font-size: 0.85rem; text-align: center; margin: 0;">If you have questions, <a href="https://computer-support-ict.vercel.app/contact" style="color: #38bdf8;">contact us</a>.</p>`}
    `),
  });
}

export async function sendContactAutoReply(toEmail, name) {
  await send({
    to: toEmail,
    subject: 'We received your message — CS Hub (iCT)',
    html: baseHtml(`
      <h2 style="color: #f8fafc; text-align: center; margin: 0 0 8px;">Thank You, ${name}!</h2>
      <p style="color: #cbd5e1; text-align: center; margin: 0 0 20px;">We have received your message and will get back to you within 24 hours.</p>
      <p style="color: #94a3b8; font-size: 0.85rem; text-align: center; margin: 0;">
        In the meantime, check our <a href="https://computer-support-ict.vercel.app/" style="color: #38bdf8;">services</a> or visit the <a href="https://computer-support-ict.vercel.app/dashboard" style="color: #38bdf8;">dashboard</a> to submit a support ticket.
      </p>
    `),
  });
}

export async function sendTeamApplicationReceived(toEmail, name) {
  await send({
    to: toEmail,
    subject: 'Application Received — CS Hub (iCT)',
    html: baseHtml(`
      <h2 style="color: #f8fafc; text-align: center; margin: 0 0 8px;">Thank You, ${name}!</h2>
      <p style="color: #cbd5e1; text-align: center; margin: 0 0 20px;">We have received your team application and will review it shortly.</p>
      <p style="color: #94a3b8; font-size: 0.85rem; text-align: center; margin: 0;">
        You will receive an email once your application is reviewed. Track your status in your <a href="https://computer-support-ict.vercel.app/dashboard" style="color: #38bdf8;">dashboard</a>.
      </p>
    `),
  });
}

export async function sendAccountSetupEmail(toEmail, token) {
  const link = `https://computer-support-ict.vercel.app/setup-account?email=${encodeURIComponent(toEmail)}&token=${token}`;
  await send({
    to: toEmail,
    subject: 'Set Up Your Account — CS Hub (iCT)',
    html: baseHtml(`
      <h2 style="color: #f8fafc; text-align: center; margin: 0 0 8px;">Your Team Application Was Approved!</h2>
      <p style="color: #cbd5e1; text-align: center; margin: 0 0 20px;">
        Hi <strong style="color:#f8fafc;">${toEmail}</strong>, please set up your account to access your dashboard and team features.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${link}" style="display: inline-block; background: #ffce08; color: #1e1b4b; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1rem;">Set Up Account</a>
      </div>
      <p style="color: #94a3b8; font-size: 0.85rem; text-align: center; margin: 0;">
        Or paste this link in your browser:<br>
        <span style="color: #38bdf8; word-break: break-all;">${link}</span>
      </p>
    `),
  });
}

export async function sendAdminNotification(subject, body) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  await send({
    to: adminEmail,
    subject: `[Admin] ${subject}`,
    html: baseHtml(`
      <h2 style="color: #f8fafc; text-align: center; margin: 0 0 8px;">Admin Notification</h2>
      <div style="background: #1e293b; border-radius: 10px; padding: 16px;">
        <p style="margin: 0; color: #cbd5e1; line-height: 1.6; white-space: pre-wrap;">${body}</p>
      </div>
    `),
  });
}
