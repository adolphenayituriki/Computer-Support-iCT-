const ALIGNMENT_PATTERNS = [
  [], [6,18], [6,22], [6,26], [6,30], [6,34],
  [6,22,38], [6,24,42], [6,26,46], [6,28,50], [6,30,54],
  [6,32,58], [6,34,62],
];

const EC_CODEWORDS = {
  L: [7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28],
  M: [10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26],
  Q: [13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,28,28,28,28,28],
  H: [17,28,22,16,22,28,26,26,24,28,24,28,30,24,30,24,30,30,26,28],
};

const DATA_CODEWORDS = {
  L: [19,34,55,80,108,136,156,194,232,274,324,370,428,461,523,589,647,721,795,861],
  M: [16,28,44,64,86,108,124,154,182,216,254,290,334,365,415,453,507,563,627,669],
  Q: [13,22,34,48,62,76,88,110,132,154,180,206,244,261,292,322,352,372,425,452],
  H: [9,16,26,36,46,60,66,86,100,122,140,158,180,197,220,250,280,310,338,382],
};

const FORMAT_INFO = [
  0x5412,0x5125,0x5E7C,0x5B4B,0x45F9,0x40CE,0x4F97,0x4AA0,0x77C4,0x72F3,0x7DAA,0x789D,0x662F,0x6318,0x6C41,0x6976,
  0x1689,0x13BE,0x1CE7,0x19D0,0x0762,0x0255,0x0D0C,0x083B,0x355F,0x3068,0x3F31,0x3A06,0x24B4,0x2183,0x2EDA,0x2BED,
];

function createGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function placeFunctionPatterns(grid, size) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const val = (i < 7 && j < 7) ? (
        (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) ? 1 : 0
      ) : 0;
      grid[i][j] = val;
      grid[size - 1 - i][j] = val;
      grid[i][size - 1 - j] = val;
    }
  }

  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0 ? 1 : 0;
    grid[i][6] = i % 2 === 0 ? 1 : 0;
  }

  for (let i = 0; i < 7; i++) {
    grid[i][size - 8] = 0;
    grid[size - 8][i] = 0;
  }
  grid[size - 8][8] = 1;

  if (size > 21) {
    const alignPos = [size - 9];
    for (const row of alignPos) {
      for (const col of alignPos) {
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            const val = (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) ? 1 : 0;
            if (grid[row + r][col + c] === null) grid[row + r][col + c] = val;
          }
        }
      }
    }
  }
}

function galoantilog(a, m) {
  let x = 1;
  for (let i = 0; i < m; i++) {
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
    if (i === a - 1) return x;
  }
  return x;
}

function getECCode(version, ecLevel) {
  const levels = { L: 0, M: 1, Q: 2, H: 3 };
  const size = 17 + version * 4;
  const numBlocks = [1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7][version - 1];
  const totalData = EC_CODEWORDS[ecLevel][version - 1];
  const totalEC = 2 * (totalData / numBlocks);
  return { numBlocks, totalData, totalECPerBlock: Math.floor(totalEC / numBlocks) };
}

function generateQR(text, ecLevel = 'M') {
  const dataBytes = [];
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 128) dataBytes.push(c);
    else if (c < 2048) { dataBytes.push(0xc0 | (c >> 6)); dataBytes.push(0x80 | (c & 0x3f)); }
    else { dataBytes.push(0xe0 | (c >> 12)); dataBytes.push(0x80 | ((c >> 6) & 0x3f)); dataBytes.push(0x80 | (c & 0x3f)); }
  }

  let version = 1;
  for (let v = 1; v <= 20; v++) {
    const capacity = DATA_CODEWORDS[ecLevel][v - 1] - 2 - (v >= 10 ? 2 : 0);
    if (dataBytes.length <= capacity) { version = v; break; }
    if (v === 20) throw new Error('Data too long');
  }

  const size = 17 + version * 4;
  const { numBlocks, totalData, totalECPerBlock } = getECCode(version, ecLevel);
  const ecPerBlock = totalECPerBlock;

  let bitStream = 0;
  let bitLen = 0;
  const pushBits = (val, len) => { bitStream = (bitStream << len) | val; bitLen += len; };

  const mode = 4;
  pushBits(mode, 4);
  if (version <= 9) pushBits(dataBytes.length, 8);
  else pushBits(dataBytes.length, 16);

  for (const b of dataBytes) pushBits(b, 8);

  const totalDataBits = totalData * 8;
  while (bitLen < totalDataBits) { pushBits(0, Math.min(4, totalDataBits - bitLen)); }
  while (bitLen % 8) pushBits(0, 1);

  const dataWords = [];
  for (let i = 0; i < totalData; i++) {
    const byteVal = (bitStream >> ((totalData - 1 - i) * 8)) & 0xff;
    dataWords.push(byteVal);
  }

  const ecWords = [];
  for (let b = 0; b < numBlocks; b++) {
    const blockData = dataWords.slice(b * (totalData / numBlocks), (b + 1) * (totalData / numBlocks));
    const ec = [];
    for (let i = 0; i < ecPerBlock; i++) ec.push(0);
    for (const d of blockData) {
      const lead = d ^ ec.shift();
      ec.push(0);
      for (let i = 0; i < ec.length; i++) {
        ec[i] ^= lead ? (galoantilog(lead, 8) >> (7 - i) & 1 ? 0x11d >> (7 - i) & 1 ? 0 : 0x11d & 0xff : 0) : 0;
      }
    }
  }

  const finalData = [];
  const blockSize = totalData / numBlocks;
  for (let i = 0; i < blockSize; i++) {
    for (let b = 0; b < numBlocks; b++) {
      if (i < blockSize) finalData.push(dataWords[b * blockSize + i]);
    }
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < numBlocks; b++) {
      const ecBlock = [];
      const blockData = dataWords.slice(b * blockSize, (b + 1) * blockSize);
      const ec = [];
      for (let j = 0; j < ecPerBlock; j++) ec.push(0);
      for (const d of blockData) {
        const lead = d ^ ec.shift();
        ec.push(0);
        for (let k = 0; k < ec.length; k++) {
          const exp = galoantilog(lead, 8);
          ec[k] ^= exp & (1 << (ecPerBlock - 1 - k)) ? 1 : 0;
        }
      }
      finalData.push(ec[i]);
    }
  }

  const grid = createGrid(size);
  placeFunctionPatterns(grid, size);

  let bitIdx = 0;
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5;
    for (let row = 0; row < size; row++) {
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (cc < 0 || cc >= size) continue;
        if (grid[row][cc] !== null) continue;
        const bit = bitIdx < finalData.length * 8 ? (finalData[Math.floor(bitIdx / 8)] >> (7 - (bitIdx % 8))) & 1 : 0;
        grid[row][cc] = bit;
        bitIdx++;
      }
    }
  }

  const maskFn = [
    (r, c) => (r + c) % 2 === 0,
    (r, c) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => (r * c) % 2 + (r * c) % 3 === 0,
    (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
    (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
  ];

  let bestMask = 0;
  let bestPenalty = Infinity;
  for (let m = 0; m < 8; m++) {
    const testGrid = grid.map(r => [...r]);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (testGrid[r][c] !== null && !(
          (r < 9 && c < 9) || (r < 9 && c > size - 9) || (r > size - 9 && c < 9) ||
          (r === 6 || c === 6) || (r === size - 8 && c <= 8) || (c === size - 8 && r <= 8)
        )) {
          if (maskFn[m](r, c)) testGrid[r][c] ^= 1;
        }
      }
    }
    let penalty = 0;
    for (let r = 0; r < size; r++) {
      let run = 1;
      for (let c = 1; c < size; c++) {
        if (testGrid[r][c] === testGrid[r][c - 1]) run++;
        else { if (run >= 5) penalty += run - 2; run = 1; }
      }
      if (run >= 5) penalty += run - 2;
    }
    for (let c = 0; c < size; c++) {
      let run = 1;
      for (let r = 1; r < size; r++) {
        if (testGrid[r][c] === testGrid[r - 1][c]) run++;
        else { if (run >= 5) penalty += run - 2; run = 1; }
      }
      if (run >= 5) penalty += run - 2;
    }
    if (penalty < bestPenalty) { bestPenalty = penalty; bestMask = m; }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== null && !(
        (r < 9 && c < 9) || (r < 9 && c > size - 9) || (r > size - 9 && c < 9) ||
        (r === 6 || c === 6) || (r === size - 8 && c <= 8) || (c === size - 8 && r <= 8)
      )) {
        if (maskFn[bestMask](r, c)) grid[r][c] ^= 1;
      }
    }
  }

  const fmtBits = FORMAT_INFO[bestMask] ^ ({ L: 1, M: 0, Q: 3, H: 2 }[ecLevel] << 3);
  for (let i = 0; i < 6; i++) {
    grid[8][i] = (fmtBits >> (14 - i)) & 1;
    grid[i][8] = (fmtBits >> (14 - i)) & 1;
  }
  grid[8][7] = (fmtBits >> 8) & 1;
  grid[7][8] = (fmtBits >> 8) & 1;
  grid[8][8] = (fmtBits >> 7) & 1;
  grid[size - 1][8] = fmtBits & 1;
  grid[size - 2][8] = (fmtBits >> 1) & 1;
  grid[size - 3][8] = (fmtBits >> 2) & 1;
  grid[size - 4][8] = (fmtBits >> 3) & 1;
  grid[size - 5][8] = (fmtBits >> 4) & 1;
  grid[size - 6][8] = (fmtBits >> 5) & 1;
  grid[8][size - 1] = (fmtBits >> 14) & 1;
  grid[8][size - 2] = (fmtBits >> 13) & 1;
  grid[8][size - 3] = (fmtBits >> 12) & 1;
  grid[8][size - 4] = (fmtBits >> 11) & 1;
  grid[8][size - 5] = (fmtBits >> 10) & 1;
  grid[8][size - 6] = (fmtBits >> 9) & 1;
  grid[8][size - 7] = (fmtBits >> 8) & 1;
  grid[8][size - 8] = (fmtBits >> 7) & 1;
  grid[size - 8][8] = (fmtBits >> 6) & 1;
  grid[size - 7][8] = (fmtBits >> 5) & 1;
  grid[size - 6][8] = (fmtBits >> 4) & 1;
  grid[size - 5][8] = (fmtBits >> 3) & 1;
  grid[size - 4][8] = (fmtBits >> 2) & 1;
  grid[size - 3][8] = (fmtBits >> 1) & 1;
  grid[size - 2][8] = fmtBits & 1;
  grid[8][size - 7] = (fmtBits >> 7) & 1;
  grid[size - 8][8] = (fmtBits >> 6) & 1;

  return { grid, size };
}

export function renderQR(canvas, text, moduleSize = 4, ecLevel = 'M') {
  const { grid, size } = generateQR(text, ecLevel);
  const padding = 4;
  canvas.width = (size + padding * 2) * moduleSize;
  canvas.height = (size + padding * 2) * moduleSize;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#1e293b';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) {
        ctx.fillRect((c + padding) * moduleSize, (r + padding) * moduleSize, moduleSize, moduleSize);
      }
    }
  }

  return canvas;
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

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, 8);

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 8, W, 4);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, H - 12, W, 12);

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, H - 16, W, 4);

  const cornerSize = 80;
  const corners = [[40, 30], [W - 40 - cornerSize, 30], [40, H - 30 - cornerSize], [W - 40 - cornerSize, H - 30 - cornerSize]];
  ctx.fillStyle = '#f59e0b';
  corners.forEach(([x, y]) => {
    ctx.fillRect(x, y, cornerSize, 6);
    ctx.fillRect(x, y, 6, cornerSize);
  });
  ctx.fillStyle = '#0f172a';
  corners.forEach(([x, y]) => {
    ctx.fillRect(x + 10, y + 10, cornerSize - 14, 3);
    ctx.fillRect(x + 10, y + 10, 3, cornerSize - 14);
  });

  if (logoSrc) {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    return new Promise((resolve) => {
      logo.onload = () => {
        const logoSize = 120;
        const logoX = W / 2 - logoSize / 2;
        const logoY = 40;
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        drawRest(ctx, W, H, userName, courseTitle, score, certId, dateStr, logoSrc);
        resolve(canvas);
      };
      logo.onerror = () => {
        drawRest(ctx, W, H, userName, courseTitle, score, certId, dateStr, null);
        resolve(canvas);
      };
      logo.src = logoSrc;
    });
  }

  drawRest(ctx, W, H, userName, courseTitle, score, certId, dateStr, null);
  return Promise.resolve(canvas);
}

function drawRest(ctx, W, H, userName, courseTitle, score, certId, dateStr, logoSrc) {
  let y = logoSrc ? 150 : 60;

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CS Hub (iCT)', W / 2, y);
  y += 22;

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 12px sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('COMPUTER SUPPORT', W / 2, y);
  ctx.letterSpacing = '0px';
  y += 50;

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('Certificate of Completion', W / 2, y);
  y += 15;

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, y);
  ctx.lineTo(W / 2 + 120, y);
  ctx.stroke();
  y += 35;

  ctx.fillStyle = '#64748b';
  ctx.font = '14px sans-serif';
  ctx.fillText('This certifies that', W / 2, y);
  y += 50;

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(userName || 'Student', W / 2, y);
  y += 10;

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 200, y);
  ctx.lineTo(W / 2 + 200, y);
  ctx.stroke();
  y += 40;

  ctx.fillStyle = '#64748b';
  ctx.font = '15px sans-serif';
  ctx.fillText('has successfully completed the course', W / 2, y);
  y += 50;

  ctx.fillStyle = '#d97706';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(`"${courseTitle}"`, W / 2, y);
  y += 60;

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(W / 2 - 350, y, 700, 1);
  y += 40;

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  const infoY = y;
  ctx.fillText(`Score: ${score}%`, W / 2 - 200, infoY);
  ctx.fillText(`Date: ${dateStr}`, W / 2, infoY);
  ctx.fillText(`ID: ${certId}`, W / 2 + 200, infoY);
  y += 60;

  const qrData = JSON.stringify({
    name: userName,
    course: courseTitle,
    score: score + '%',
    id: certId,
    date: dateStr,
    issuer: 'CS Hub (iCT) — Computer Support',
  });
  const qrCanvas = document.createElement('canvas');
  const qrSize = 180;
  renderQR(qrCanvas, qrData, Math.floor(qrSize / 33));
  const qrX = W / 2 - qrSize / 2;
  ctx.drawImage(qrCanvas, qrX, y, qrSize, qrSize);
  y += qrSize + 15;

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.fillText('Scan for verification', W / 2, y);
  y += 60;

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 300, y);
  ctx.lineTo(W / 2 - 50, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W / 2 + 50, y);
  ctx.lineTo(W / 2 + 300, y);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('Program Director', W / 2 - 175, y + 18);
  ctx.fillText('Date of Issue', W / 2 + 175, y + 18);
}
