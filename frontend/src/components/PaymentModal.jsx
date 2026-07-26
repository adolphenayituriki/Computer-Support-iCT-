import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaCheckCircle, FaExclamationCircle, FaCopy, FaUpload, FaMobileAlt, FaClock } from 'react-icons/fa';
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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-5 text-center" onClick={(e) => e.stopPropagation()}>
          <FaCheckCircle className="text-emerald-500 mx-auto mb-2" size={36} />
          <h3 className="text-sm font-bold text-slate-900">Payment Verified!</h3>
          <p className="text-xs text-slate-500 mt-0.5">Certificate is ready to download.</p>
        </div>
      </div>
    );
  }

  if (step === 'submitted') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-5 text-center" onClick={(e) => e.stopPropagation()}>
          <FaClock className="text-amber-500 mx-auto mb-2" size={36} />
          <h3 className="text-sm font-bold text-slate-900">Payment Submitted!</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-1">Under review. Certificate unlocks after approval.</p>
          {txRef && <p className="text-[10px] text-slate-400 font-mono mb-2">{txRef}</p>}
          <button onClick={onClose} className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>

        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <FaMobileAlt className="text-amber-600" size={14} />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-slate-900 leading-tight">Certificate Payment</h3>
                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{courseTitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
              <FaTimes className="text-slate-400" size={11} />
            </button>
          </div>

          <div className="text-center mb-3">
            <span className="text-2xl font-black text-slate-900">{formattedAmount}</span>
            <span className="text-xs font-bold text-slate-400 ml-1">RWF</span>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-2.5 border border-amber-200/60 mb-3">
            <div className="flex items-center justify-between">
              <button onClick={copyNumber} className="flex items-center gap-2 flex-1 min-w-0 bg-white rounded-lg px-2.5 py-2 border border-amber-200/80 hover:border-amber-300 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 font-mono leading-tight">{momoNumber}</p>
                  <p className="text-[9px] text-slate-400">{momoName}</p>
                </div>
              </button>
              <button onClick={copyNumber} className="ml-2 w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 hover:bg-amber-600 transition-colors" title="Copy number">
                {copied ? <FaCheckCircle className="text-white" size={12} /> : <FaCopy className="text-white" size={12} />}
              </button>
            </div>
            <p className="text-[9px] text-amber-600/70 mt-1.5 text-center">Send exactly {formattedAmount} RWF via MTN MoMo</p>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Phone <span className="font-normal">(optional)</span></label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Receipt *</label>
              {receiptPreview ? (
                <div className="relative rounded-lg border border-slate-200 overflow-hidden h-[34px]">
                  <img src={receiptPreview} alt="Receipt" className="w-full h-full object-cover" />
                  <button onClick={() => { setReceiptFile(null); setReceiptPreview(''); }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                    <FaTimes size={7} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-dashed border-slate-200 bg-slate-50/50 h-[34px] cursor-pointer hover:border-amber-300 hover:bg-amber-50/50 transition-all">
                  <FaUpload size={10} className="text-slate-400" />
                  <span className="text-[10px] font-medium text-slate-400">Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 p-2 bg-red-50 rounded-lg border border-red-200 mb-2">
              <FaExclamationCircle className="text-red-400 shrink-0" size={11} />
              <p className="text-[10px] text-red-600">{error}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading || !receiptFile}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
            {loading ? <><FaSpinner className="animate-spin" size={12} /> Submitting...</> : 'Submit Payment for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
