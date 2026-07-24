import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { FaPrint, FaDownload, FaTrophy, FaCheckCircle } from 'react-icons/fa';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './CertificatePrint.css';

function generateCertNumber(courseCategory, userId, courseId) {
  const catAbbr = { general: 'GN', hardware: 'HW', software: 'SW', network: 'NW', virus: 'VS', training: 'TR' };
  const abbr = catAbbr[courseCategory] || 'GN';
  const year = new Date().getFullYear();
  let seq = 1;
  try {
    const key = `cshub-cert-seq-${year}`;
    const stored = parseInt(localStorage.getItem(key) || '0', 10);
    seq = stored + 1;
    localStorage.setItem(key, String(seq));
  } catch { /* ignore */ }
  return `CSH-${abbr}-${year}-${String(seq).padStart(6, '0')}`;
}

function generateVerificationCode(userId, courseId) {
  const raw = `${userId || 'guest'}:${courseId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().padEnd(8, '0').slice(0, 8);
}

function SealStamp() {
  return (
    <div className="flex items-center justify-center">
      <FaCheckCircle size={70} style={{ color: '#FCCF35' }} />
    </div>
  );
}

function QRSection({ qrData }) {
  const canvasRef = useRef(null);
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || !qrData) return;
    QRCode.toCanvas(canvasRef.current, qrData, {
      width: 160,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#334155', light: '#ffffff' },
    }).catch(() => {});
    try { setQrUrl(canvasRef.current.toDataURL('image/png')); } catch {}
  }, [qrData]);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="cert-qr-wrapper rounded-lg">
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {qrUrl ? (
          <img src={qrUrl} alt="Certificate Verification QR Code" className="w-[88px] h-[88px]" />
        ) : (
          <div className="w-[88px] h-[88px] bg-slate-50 flex items-center justify-center text-[8px] text-slate-300 rounded" />
        )}
      </div>
      <p className="text-[7px] text-slate-400 tracking-wide uppercase">Scan to Verify</p>
    </div>
  );
}

export default function Certificate({
  course,
  userName,
  userId,
  curriculum,
  assessmentScore,
  assessmentPassed,
  completedAt,
}) {
  const [logoError, setLogoError] = useState(false);
  const [exporting, setExporting] = useState(false);

  const certData = useMemo(() => {
    const cat = course?.category || 'general';
    const certNumber = generateCertNumber(cat, userId, course?._id);
    const verificationCode = generateVerificationCode(userId, course?._id);
    const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const qrPayload = `https://cshub.rw/verify/${certNumber}?code=${verificationCode}&d=${encodeURIComponent(issueDate)}`;

    return { certNumber, verificationCode, issueDate, qrPayload };
  }, [course, userName, userId, assessmentPassed, completedAt]);

  const displayScore = assessmentScore || 0;
  const certRef = useRef(null);

  const handlePrint = () => window.print();

  const handleDownloadPDF = useCallback(async () => {
    if (!certRef.current || exporting) return;
    setExporting(true);

    const el = certRef.current;

    await document.fonts.ready;

    const imgs = el.querySelectorAll('img');
    await Promise.all(Array.from(imgs).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    const origStyle = {
      overflow: el.style.overflow,
      aspectRatio: el.style.aspectRatio,
      width: el.style.width,
      maxWidth: el.style.maxWidth,
      height: el.style.height,
      boxShadow: el.style.boxShadow,
      borderRadius: el.style.borderRadius,
      transform: el.style.transform,
      position: el.style.position,
    };

    el.style.overflow = 'visible';
    el.style.aspectRatio = 'auto';
    el.style.width = '1122px';
    el.style.maxWidth = '1122px';
    el.style.height = '794px';
    el.style.boxShadow = 'none';
    el.style.borderRadius = '0';
    el.style.transform = 'none';

    try {
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1122,
        height: 794,
        windowWidth: 1122,
        windowHeight: 794,
        onclone: (doc) => {
          const clone = doc.querySelector('.cert-print-container');
          if (clone) {
            clone.style.overflow = 'visible';
            clone.style.aspectRatio = 'auto';
            clone.style.width = '1122px';
            clone.style.maxWidth = '1122px';
            clone.style.height = '794px';
            clone.style.boxShadow = 'none';
            clone.style.borderRadius = '0';
            clone.style.transform = 'none';
            clone.style.margin = '0';
            clone.style.position = 'relative';
          }
          const wrapper = doc.querySelector('.cert-page-wrapper');
          if (wrapper) {
            wrapper.style.background = 'white';
            wrapper.style.padding = '0';
            wrapper.style.margin = '0';
            wrapper.style.minHeight = 'auto';
          }
        },
      });

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`Certificate-${(course?.title || 'Course').replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      window.print();
    } finally {
      Object.entries(origStyle).forEach(([key, val]) => {
        el.style[key] = val || '';
      });
      setExporting(false);
    }
  }, [course?.title]);

  return (
    <div className="cert-page-wrapper bg-slate-100 min-h-screen flex flex-col items-center justify-start py-6 px-4 sm:px-6 lg:px-8">
      {/* Certificate — landscape on screen */}
      <div ref={certRef} className="cert-print-container cert-landscape cert-border-outer bg-white relative w-full max-w-[960px] shadow-2xl shadow-blue-900/10 rounded-sm overflow-hidden flex flex-col cert-bg-gradient">
        {/* Decorative corners */}
        <div className="cert-corner cert-corner-tl" />
        <div className="cert-corner cert-corner-tr" />
        <div className="cert-corner cert-corner-bl" />
        <div className="cert-corner cert-corner-br" />
        <div className="cert-corner cert-corner-inner-tl" />
        <div className="cert-corner cert-corner-inner-tr" />
        <div className="cert-corner cert-corner-inner-bl" />
        <div className="cert-corner cert-corner-inner-br" />

        {/* Inner border */}
        <div className="cert-border-inner m-3 sm:m-4 flex-1 flex flex-col">
          <div className="pt-3 sm:pt-4 md:pt-5 px-3 sm:px-4 md:px-5 pb-0 flex flex-col items-center h-full relative">
            {/* Tick icon — top left */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
              <FaCheckCircle size={22} style={{ color: '#FCCF35' }} />
            </div>

            {/* Header: Logo + Branding */}
            <div className="flex items-center gap-3 mb-0.5">
              {!logoError ? (
                <img
                  src="/LOGO IMAGE.png"
                  alt="CS Hub Logo"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FCCF3520', border: '2px solid #FCCF3550' }}>
                  <span className="cert-serif text-lg sm:text-xl font-bold" style={{ color: '#FCCF35' }}>CS</span>
                </div>
              )}
              <div className="flex flex-col">
                <h2 className="cert-serif text-sm sm:text-base font-bold text-slate-800 tracking-wide leading-tight">CS Hub (iCT)</h2>
                <p className="text-[7px] sm:text-[8px] font-semibold tracking-[0.3em] uppercase" style={{ color: '#FCCF35' }}>Computer Support</p>
              </div>
            </div>

            <div className="cert-divider mb-1.5" />

            {/* Title */}
            <h1 className="cert-serif text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-wide mb-0.5 text-center">
              CERTIFICATE OF COMPLETION
            </h1>
            <div className="cert-divider-long mb-1.5" />

            {/* Presentation + Name */}
            <p className="cert-serif-body text-[10px] sm:text-xs text-slate-500 mb-0.5 text-center italic">
              This certificate is proudly presented to
            </p>
            <h2 className="cert-name text-3xl sm:text-4xl md:text-5xl leading-none mb-0.5 text-center" style={{ color: '#FCCF35' }}>
              {userName || 'Student'}
            </h2>
            <div className="w-[220px] sm:w-[280px] h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #FCCF35, transparent)' }} />

            {/* Course Title */}
            <p className="cert-serif-body text-[10px] sm:text-xs text-slate-500 mb-0 text-center">
              for successfully completing the course
            </p>
            <h3 className="cert-serif text-sm sm:text-base md:text-lg font-bold text-slate-800 text-center mb-0.5 max-w-[480px] leading-snug">
              {course?.title || 'Course Title'}
            </h3>

            {/* Completion Statement + Date */}
            <p className="cert-serif-body text-[8px] sm:text-[9px] text-slate-400 text-center mb-0 max-w-[400px] leading-relaxed">
              The recipient has completed all required modules and lessons, and has successfully passed the final assessment.
            </p>
            <p className="cert-serif text-[8px] sm:text-[9px] font-semibold text-slate-600 text-center mb-1">
              Issued on {certData.issueDate}
            </p>

            {/* Score */}
            <div className="flex items-center gap-2 mb-1 rounded-lg px-4 py-1" style={{ backgroundColor: '#FCCF3515', border: '1px solid #FCCF3530' }}>
              <FaTrophy size={12} style={{ color: '#FCCF35' }} />
              <div className="text-center">
                <p className="text-[7px] uppercase tracking-wider font-semibold" style={{ color: '#d4a017' }}>Assessment Score</p>
                <p className="cert-serif text-sm sm:text-base font-bold" style={{ color: '#d4a017' }}>{displayScore}%</p>
              </div>
            </div>

            {/* Spacer pushes bottom content down */}
            <div className="flex-1" />

            {/* Bottom row: Cert info | Seal | QR */}
            <div className="w-full flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 mb-2">
              {/* Left: Certificate details */}
              <div className="text-center sm:text-left">
                <div className="mb-1.5">
                  <p className="text-[7px] text-slate-400 uppercase tracking-wider font-medium mb-0">Certificate Number</p>
                  <p className="text-[9px] font-bold text-slate-800 font-mono tracking-wider">{certData.certNumber}</p>
                </div>
                <div>
                  <p className="text-[7px] text-slate-400 uppercase tracking-wider font-medium mb-0">Verification Code</p>
                  <p className="text-[9px] font-bold text-slate-800 font-mono tracking-wider">{certData.verificationCode}</p>
                </div>
              </div>

              {/* Center: Seal */}
              <div className="flex flex-col items-center shrink-0">
                <SealStamp />
              </div>

              {/* Right: QR Code */}
              <div className="flex flex-col items-center shrink-0">
                <QRSection qrData={certData.qrPayload} />
              </div>
            </div>

            {/* Signatures */}
            <div className="w-full flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 mb-1 px-0 sm:px-6">
              {/* Course Instructor */}
              <div className="flex flex-col items-center w-[160px]">
                <img src="/SIGNATURE.png" alt="Signature" className="h-7 sm:h-8 object-contain mb-0" />
                <div className="w-full h-[1px] bg-slate-300 mb-1" />
                <p className="cert-serif text-[9px] sm:text-[10px] font-bold text-slate-800">NAYITURIKI Adolphe</p>
                <p className="text-[6px] sm:text-[7px] text-slate-400">CEO of CS HUB (iCT)</p>
              </div>

              {/* Training Director */}
              <div className="flex flex-col items-center w-[160px]">
                <img src="/MUYISINGIZEMWESE EVODE.jpg" alt="Signature" className="h-7 sm:h-8 object-contain mb-0" />
                <div className="w-full h-[1px] bg-slate-300 mb-1" />
                <p className="cert-serif text-[9px] sm:text-[10px] font-bold text-slate-800">Evode MUYISINGIZE</p>
                <p className="text-[6px] sm:text-[7px] text-slate-400">Training Director of CS HUB (iCT)</p>
              </div>
            </div>

            {/* Footer — flush to bottom */}
            <div className="w-full text-center mt-auto pb-0">
              <p className="text-[7px] sm:text-[8px] text-slate-400">
                <span className="font-semibold" style={{ color: '#FCCF35' }}>cshub.rw@gmail.com</span>
                <span className="mx-2 text-slate-200">|</span>
                <span className="italic">Empowering Digital Skills Through Practical Learning</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print / Download buttons — hidden when printing */}
      <div className="cert-no-print flex items-center gap-3 mt-5 mb-8">
        <button
          onClick={handleDownloadPDF}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold transition-all shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          style={{ backgroundColor: '#FCCF35', color: '#1e293b', boxShadow: exporting ? 'none' : '0 4px 14px rgba(252,207,53,0.4)' }}
          onMouseEnter={e => { if (!exporting) { e.currentTarget.style.backgroundColor = '#e6b800'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(252,207,53,0.5)'; }}}
          onMouseLeave={e => { if (!exporting) { e.currentTarget.style.backgroundColor = '#FCCF35'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(252,207,53,0.4)'; }}}
        >
          {exporting ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full" /> Generating...</> : <><FaDownload size={14} /> Download PDF</>}
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-7 py-3 bg-slate-700 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
        >
          <FaPrint size={14} /> Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
