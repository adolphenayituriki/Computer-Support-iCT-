import 'dotenv/config';

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';
const toEmail = process.argv[2];
const msg = process.argv[3];

if (!toEmail) {
  console.error('Usage: node scripts/send-email.js <email> "<message>"');
  process.exit(1);
}

const html = `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background: #0f172a; border-radius: 14px; color: #e2e8f0;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 1.6rem; font-weight: 800; color: #ffce08;">CS H</span><span style="font-size: 1.6rem; font-weight: 300; color: #ffce08;">ub</span>
      <span style="font-size: 1.6rem; font-weight: 300; color: #ffce08;">(</span><span style="font-size: 1.6rem; font-weight: 300; color: #38bdf8;">iCT</span><span style="font-size: 1.6rem; font-weight: 300; color: #ffce08;">)</span>
      <div style="font-size: 0.65rem; color: #94a3b8; letter-spacing: 2px;">COMPUTER SUPPORT</div>
    </div>
    <h2 style="color: #f8fafc; text-align: center; margin: 0 0 16px;">Hello!</h2>
    <p style="color: #cbd5e1; text-align: center; line-height: 1.6; margin: 0 0 16px;">${msg || 'Please re-apply to join our team at CS Hub (iCT).'}</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="https://computer-support-ict.vercel.app/" style="display: inline-block; background: #ffce08; color: #1e1b4b; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700;">Visit CS Hub</a>
    </div>
    <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0 16px;" />
    <div style="text-align: center; margin-bottom: 16px;">
      <p style="color: #f8fafc; font-size: 0.85rem; font-weight: 700; margin: 0 0 6px;">For More Information</p>
      <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0 0 4px;">Call or WhatsApp: <a href="tel:+250780505948" style="color: #38bdf8; text-decoration: none;">+250 780 505 948</a></p>
      <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0;">Join our WhatsApp Group: <a href="https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN" style="color: #38bdf8; text-decoration: none;">Click here to join</a></p>
    </div>
    <p style="color: #475569; font-size: 0.75rem; text-align: center; margin: 0;">CS Hub (iCT) — Computer Support for All Rwandans</p>
  </div>
`;

try {
  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'CS Hub (iCT)', email: process.env.BREVO_FROM_EMAIL },
      to: [{ email: toEmail }],
      subject: 'Re-apply to CS Hub (iCT) Team',
      htmlContent: html,
    }),
  });
  if (res.ok) {
    console.log('Sent!');
  } else {
    const err = await res.text();
    console.error('Error:', err);
  }
} catch (err) {
  console.error('Failed:', err.message);
}
