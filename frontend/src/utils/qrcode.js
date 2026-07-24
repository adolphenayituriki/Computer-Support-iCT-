import QRCode from 'qrcode';

function drawTickIcon(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.35;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.35, cy + size * 0.05);
  ctx.lineTo(cx - size * 0.05, cy + size * 0.35);
  ctx.lineTo(cx + size * 0.4, cy - size * 0.25);
  ctx.stroke();
  ctx.restore();
}

function drawZigzagWatermark(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = '#FCCF35';
  ctx.lineWidth = 1;
  for (let i = -H; i < W + H; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }
  ctx.strokeStyle = '#3b82f6';
  ctx.globalAlpha = 0.03;
  for (let i = -H; i < W + H; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i + H, 0);
    ctx.lineTo(i, H);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCorners(ctx, W, H) {
  const m = 30;
  const s = 65;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.5;
  [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * s);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * s, y);
    ctx.stroke();
  });
  ctx.strokeStyle = '#d4d4d8';
  ctx.lineWidth = 1;
  const m2 = 48;
  const s2 = 45;
  [[m2, m2, 1, 1], [W - m2, m2, -1, 1], [m2, H - m2, 1, -1], [W - m2, H - m2, -1, -1]].forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * s2);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * s2, y);
    ctx.stroke();
  });
}

function drawSignatures(ctx, W, H) {
  const sigY = H - 180;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.15, sigY);
  ctx.lineTo(W * 0.35, sigY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W * 0.65, sigY);
  ctx.lineTo(W * 0.85, sigY);
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('NAYITURIKI Adolphe', W * 0.25, sigY + 20);
  ctx.fillText('Evode MUYISINGIZE', W * 0.75, sigY + 20);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.fillText('CEO of CS HUB (iCT)', W * 0.25, sigY + 36);
  ctx.fillText('Training Director — CS HUB (iCT)', W * 0.75, sigY + 36);
}

function drawFooter(ctx, W, H) {
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('cshub.rw@gmail.com  |  Empowering Digital Skills Through Practical Learning', W / 2, H - 35);
}

export function generateCertificateCanvas({ userName, courseTitle, score, certId, dateStr, logoSrc }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1130;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  drawZigzagWatermark(ctx, W, H);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 14, W - 36, H - 28);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(25, 20, W - 50, H - 40);

  drawCorners(ctx, W, H);

  drawTickIcon(ctx, 70, 65, 20, '#FCCF35');

  if (logoSrc) {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    return new Promise((resolve) => {
      logo.onload = () => {
        ctx.drawImage(logo, 100, 35, 90, 90);
        drawRest(ctx, W, H, userName, courseTitle, score, certId, dateStr, true);
        resolve(canvas);
      };
      logo.onerror = () => {
        drawRest(ctx, W, H, userName, courseTitle, score, certId, dateStr, false);
        resolve(canvas);
      };
      logo.src = logoSrc;
    });
  }

  drawRest(ctx, W, H, userName, courseTitle, score, certId, dateStr, false);
  return Promise.resolve(canvas);
}

function drawRest(ctx, W, H, userName, courseTitle, score, certId, dateStr, hasLogo) {
  const centerX = W / 2;
  let y = 75;

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CS Hub (iCT)', centerX + (hasLogo ? 50 : 0), y);

  ctx.fillStyle = '#FCCF35';
  ctx.font = '600 11px sans-serif';
  ctx.fillText('COMPUTER SUPPORT', centerX + (hasLogo ? 50 : 0), y + 20);

  y += 55;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 80, y);
  ctx.lineTo(centerX + 80, y);
  ctx.stroke();

  y += 35;
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('CERTIFICATE OF COMPLETION', centerX, y);

  y += 15;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - 250, y);
  ctx.lineTo(centerX + 250, y);
  ctx.stroke();

  y += 35;
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 15px Georgia, serif';
  ctx.fillText('This certificate is proudly presented to', centerX, y);

  y += 50;
  ctx.fillStyle = '#FCCF35';
  ctx.font = '60px Great Vibes, Georgia, cursive';
  ctx.fillText(userName || 'Student', centerX, y);

  y += 8;
  const grad = ctx.createLinearGradient(centerX - 250, 0, centerX + 250, 0);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.5, '#FCCF35');
  grad.addColorStop(1, 'transparent');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - 250, y);
  ctx.lineTo(centerX + 250, y);
  ctx.stroke();

  y += 35;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('for successfully completing the course', centerX, y);

  y += 40;
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px Georgia, serif';
  const maxW = 600;
  let title = courseTitle || 'Course Title';
  if (ctx.measureText(title).width > maxW) {
    while (ctx.measureText(title + '...').width > maxW && title.length > 0) title = title.slice(0, -1);
    title += '...';
  }
  ctx.fillText(title, centerX, y);

  y += 30;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Georgia, serif';
  ctx.fillText('The recipient has completed all required modules and lessons,', centerX, y);
  y += 18;
  ctx.fillText('and has successfully passed the final assessment.', centerX, y);

  y += 25;
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.fillText(`Issued on ${dateStr}`, centerX, y);

  y += 30;
  const badgeW = 220;
  const badgeH = 36;
  ctx.fillStyle = '#FCCF3515';
  ctx.strokeStyle = '#FCCF3530';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(centerX - badgeW / 2, y - badgeH / 2, badgeW, badgeH, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#d4a017';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ASSESSMENT SCORE', centerX, y - 2);
  ctx.fillStyle = '#d4a017';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText(`${score}%`, centerX, y + 18);

  y += 50;

  const certInfoY = H - 260;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('CERTIFICATE NUMBER', 100, certInfoY);
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(certId, 100, certInfoY + 18);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.fillText('VERIFICATION CODE', 100, certInfoY + 40);
  const verCode = generateVerificationCodeLocal(certId);
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(verCode, 100, certInfoY + 58);

  const qrPayload = `https://cshub.rw/verify/${certId}?code=${verCode}&d=${encodeURIComponent(dateStr)}`;
  const qrCanvas = document.createElement('canvas');
  QRCode.toCanvas(qrCanvas, qrPayload, {
    width: 160,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: { dark: '#334155', light: '#ffffff' },
  }).catch(() => {});
  ctx.drawImage(qrCanvas, W - 260, certInfoY - 15, 150, 150);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Scan to Verify', W - 185, certInfoY + 145);

  drawSignatures(ctx, W, H);
  drawFooter(ctx, W, H);
}

function generateVerificationCodeLocal(certId) {
  let hash = 0;
  const raw = certId || 'guest';
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().padEnd(8, '0').slice(0, 8);
}
