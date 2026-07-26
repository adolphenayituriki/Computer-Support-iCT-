import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaCheckCircle, FaExclamationCircle, FaCopy, FaUpload, FaMobileAlt, FaShieldAlt, FaClock } from 'react-icons/fa';
import API_BASE, { fetchWithTimeout } from '../api';

function token() { return localStorage.getItem('cshub_token'); }

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PaymentModal({ courseId, courseTitle, courseFee, onClose, onPaid }) {
  const [step, setStep] = useState('form');
  const [momoNumber, setMomoNumber] = useState('0780505948');
  const [momoName, setMomoName] = useState('NAYITURIKI Adolphe');
  const [phone, setPhone] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [txRef, setTxRef] = useState('');

  const amount = courseFee || 1000;
  const formattedAmount = amount.toLocaleString();

  useEffect(() => {
    fetch(`${API_BASE}/api/payments/momo-number`)
      .then(r => r.json())
      .then(d => { if (d.momoNumber) setMomoNumber(d.momoNumber); if (d.name) setMomoName(d.name); })
      .catch(() => {});
  }, []);

  const copyNumber = () => {
    navigator.clipboard.writeText(momoNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Receipt must be less than 5MB.');
      return;
    }
    setReceiptFile(file);
    const preview = await fileToBase64(file);
    setReceiptPreview(preview);
    setError('');
  };

  const handleSubmit = async () => {
    if (!receiptFile) {
      setError('Please upload your payment receipt.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const receiptBase64 = await fileToBase64(receiptFile);
      const res = await fetchWithTimeout(`${API_BASE}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ courseId, phone: phone.trim(), receiptImage: receiptBase64 }),
      }, 30000);
      const data = await res.json().catch(() => null);
      if (!data) {
        setError(`Server error (${res.status}). Please try again.`);
        setLoading(false);
        return;
      }
      if (data.status === 'already_paid') {
        setStep('success');
        setTimeout(() => onPaid(), 1500);
        setLoading(false);
        return;
      }
      if (data.txRef) setTxRef(data.txRef);
      setStep('submitted');
    } catch (e) {
      setError(e.name === 'AbortError' ? 'Server is waking up, try again in 30s.' : 'Network error. Please try again.');
    }
    setLoading(false);
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaCheckCircle className="text-emerald-500" size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Payment Verified!</h3>
          <p className="text-xs text-slate-500">Your certificate is ready to download.</p>
        </div>
      </div>
    );
  }

  if (step === 'submitted') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaClock className="text-amber-500" size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Payment Submitted!</h3>
          <p className="text-xs text-slate-500 mb-1">Your payment is under review.</p>
          <p className="text-[10px] text-slate-400 mb-3">Certificate will unlock after admin approval.</p>
          {txRef && <p className="text-[10px] text-slate-400 font-mono mb-3 bg-slate-50 rounded-lg px-3 py-1.5 inline-block">{txRef}</p>}
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>

        <div className="relative px-5 pt-5 pb-4">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <FaTimes className="text-slate-400" size={12} />
          </button>

          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <FaMobileAlt className="text-amber-600" size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Pay Certificate Fee</h3>
              <p className="text-[11px] text-slate-400 truncate">{courseTitle}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 mb-4">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{formattedAmount}</span>
            <span className="text-sm font-bold text-slate-400 mt-1">RWF</span>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3.5 border border-amber-200/60 mb-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center shrink-0">
                <FaMobileAlt className="text-white" size={10} />
              </div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">MTN MoMo</span>
            </div>
            <button onClick={copyNumber} className="w-full flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-amber-200/80 hover:border-amber-300 transition-colors group">
              <div className="text-left">
                <p className="text-lg font-black text-slate-900 font-mono tracking-wide leading-tight">{momoNumber}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{momoName}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors shrink-0">
                {copied ? <FaCheckCircle className="text-emerald-500" size={13} /> : <FaCopy className="text-amber-600" size={13} />}
              </div>
            </button>
            <p className="text-[10px] text-amber-600/80 mt-2 text-center font-medium">Send exactly {formattedAmount} RWF</p>
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Payment Receipt *</label>
            {receiptPreview ? (
              <div className="relative rounded-xl border border-slate-200 overflow-hidden group">
                <img src={receiptPreview} alt="Receipt" className="h-32 w-full object-contain bg-slate-50" />
                <button
                  onClick={() => { setReceiptFile(null); setReceiptPreview(''); }}
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                >
                  <FaTimes size={9} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-3 py-1.5">
                  <p className="text-[10px] text-white font-medium truncate">{receiptFile?.name}</p>
                </div>
              </div>
            ) : (
              <label className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-6 text-slate-400 cursor-pointer hover:border-amber-300 hover:bg-amber-50/50 transition-all">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-amber-100 transition-colors">
                  <FaUpload size={14} />
                </div>
                <span className="text-[11px] font-semibold text-slate-500">Upload receipt</span>
                <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG up to 5MB</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 rounded-xl border border-red-200 mb-3">
              <FaExclamationCircle className="text-red-400 shrink-0" size={12} />
              <p className="text-[11px] text-red-600">{error}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading || !receiptFile}
            className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
            {loading ? <><FaSpinner className="animate-spin" size={14} /> Submitting...</> : 'Submit Payment for Review'}
          </button>

          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <FaShieldAlt size={9} /> Secure
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <FaClock size={9} /> Reviewed within 24h
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
