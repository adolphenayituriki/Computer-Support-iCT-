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
      <div style="text-align: center; margin-bottom: 16px;">
        <p style="color: #f8fafc; font-size: 0.85rem; font-weight: 700; margin: 0 0 6px;">For More Information</p>
        <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0 0 4px;">Call or WhatsApp: <a href="tel:+250780505948" style="color: #38bdf8; text-decoration: none;">+250 780 505 948</a></p>
        <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0;">Join our WhatsApp Group: <a href="https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN" style="color: #38bdf8; text-decoration: none;">Click here to join</a></p>
      </div>
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

export async function sendUserWelcome(toEmail, name) {
  await send({
    to: toEmail,
    subject: 'Welcome to CS Hub (iCT)!',
    html: baseHtml(`
      <h2 style="color: #f8fafc; text-align: center; margin: 0 0 8px;">Welcome, ${name}!</h2>
      <p style="color: #cbd5e1; text-align: center; margin: 0 0 20px;">
        You are now part of CS Hub (iCT) — Computer Support for All Rwandans.
      </p>
      <div style="background: #1e293b; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 6px; color: #94a3b8; font-size: 0.82rem;">What you can do:</p>
        <ul style="color: #cbd5e1; margin: 0; padding-left: 1.2rem; line-height: 1.7;">
          <li>Submit support tickets</li>
          <li>Send us suggestions</li>
          <li>Chat with our team</li>
          <li>Apply to join the team</li>
        </ul>
      </div>
      <p style="color: #94a3b8; font-size: 0.85rem; text-align: center; margin: 0;">
        <a href="https://computer-support-ict.vercel.app/dashboard" style="color: #38bdf8;">Go to your dashboard</a>
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

export async function sendSessionInviteConfirmation(toEmail, name, level, suggestion) {
  const levelMap = { beginner: 'Beginner', student: 'Student', professional: 'Professional' };
  const levelLabel = levelMap[level] || level || 'Not specified';
  const topicText = suggestion && suggestion.trim() ? suggestion.trim() : 'General ICT skills';

  await send({
    to: toEmail,
    subject: 'You\'re Registered! — CS Hub ICT Session',
    html: baseHtml(`
      <h2 style="color: #f8fafc; text-align: center; margin: 0 0 8px;">You're Registered!</h2>
      <p style="color: #cbd5e1; text-align: center; margin: 0 0 20px;">
        Hi <strong style="color:#f8fafc;">${name}</strong>, thank you for registering for our <strong style="color:#ffce08;">Free ICT Learning Session</strong>!
      </p>

      <div style="background: #1e293b; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 10px; color: #94a3b8; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 1px;">Your Registration Details</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 0.85rem;">Name</td>
            <td style="padding: 6px 0; color: #f8fafc; font-weight: 700; font-size: 0.9rem; text-align: right;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 0.85rem;">Email</td>
            <td style="padding: 6px 0; color: #f8fafc; font-size: 0.9rem; text-align: right;">${toEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 0.85rem;">Level</td>
            <td style="padding: 6px 0; text-align: right;">
              <span style="display: inline-block; padding: 2px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; background: ${level === 'beginner' ? '#065f46' : level === 'student' ? '#1e40af' : '#92400e'}; color: ${level === 'beginner' ? '#6ee7b7' : level === 'student' ? '#93c5fd' : '#fcd34d'};">${levelLabel}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 0.85rem;">Topic</td>
            <td style="padding: 6px 0; color: #ffce08; font-weight: 600; font-size: 0.9rem; text-align: right;">${topicText}</td>
          </tr>
        </table>
      </div>

      <div style="background: #1e293b; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px; color: #94a3b8; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 1px;">What Happens Next</p>
        <ul style="color: #cbd5e1; margin: 0; padding-left: 1.2rem; line-height: 2;">
          <li>We'll review your registration and <strong style="color:#f8fafc;">match you with a session</strong> based on your level and topic.</li>
          <li>You'll receive a <strong style="color:#ffce08;">session schedule</strong> with date, time, and meeting details.</li>
          <li>Join our WhatsApp group to <strong style="color:#f8fafc;">connect with other learners</strong> and get updates.</li>
        </ul>
      </div>

      <div style="text-align: center; margin-bottom: 8px;">
        <a href="https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN" style="display: inline-block; background: #25d366; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 0.9rem;">Join WhatsApp Group</a>
      </div>

      <p style="color: #6ee7b7; font-size: 0.9rem; text-align: center; margin: 16px 0 0; font-weight: 600;">
        We'll contact you soon with session details!
      </p>
    `),
  });
}

export async function sendSessionInviteAdminNotification(invite) {
  await sendAdminNotification('New Session Registration',
    `Name: ${invite.name}\nEmail: ${invite.email}\nPhone: ${invite.phone || 'N/A'}\nLevel: ${invite.level}${invite.suggestion ? '\nTopic: ' + invite.suggestion : ''}`
  );
}

export async function sendSessionStatusUpdate(toEmail, name, status, suggestion) {
  const statusMap = {
    contacted: { title: 'We\'ve Reached Out!', color: '#3b82f6', message: 'Our team has reviewed your registration and is ready to connect with you. Expect a call or message soon to discuss your session details.' },
    confirmed: { title: 'Session Confirmed!', color: '#10b981', message: 'Your learning session has been confirmed! We\'ll send you the date, time, and meeting details shortly.' },
  };
  const info = statusMap[status];
  if (!info) return;

  await send({
    to: toEmail,
    subject: `${info.title} — CS Hub ICT Session`,
    html: baseHtml(`
      <h2 style="color: #f8fafc; text-align: center; margin: 0 0 8px;">${info.title}</h2>
      <p style="color: #cbd5e1; text-align: center; margin: 0 0 20px;">
        Hi <strong style="color:#f8fafc;">${name}</strong>, ${info.message}
      </p>
      <div style="background: #1e293b; border-radius: 10px; padding: 16px; margin-bottom: 16px; text-align: center;">
        <p style="margin: 0 0 6px; color: #94a3b8; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 1px;">Status</p>
        <span style="display: inline-block; padding: 6px 20px; border-radius: 50px; font-weight: 700; font-size: 0.85rem; background: ${info.color}20; color: ${info.color}; text-transform: uppercase;">${status}</span>
        ${suggestion ? `<p style="margin: 12px 0 0; color: #cbd5e1; font-size: 0.85rem;">Your topic: <strong style="color:#ffce08;">${suggestion}</strong></p>` : ''}
      </div>
      <p style="color: #94a3b8; font-size: 0.85rem; text-align: center; margin: 0;">
        Questions? <a href="https://computer-support-ict.vercel.app/contact" style="color: #38bdf8;">Contact us</a> or reply to this email.
      </p>
    `),
  });
}
