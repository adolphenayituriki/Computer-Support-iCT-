import { useState } from 'react';
import { FaTimes, FaSpinner, FaMobileAlt, FaCreditCard, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import API_BASE, { fetchWithTimeout } from '../api';

function token() { return localStorage.getItem('cshub_token'); }

export default function PaymentModal({ courseId, courseTitle, courseFee, onClose, onPaid }) {
  const [method, setMethod] = useState(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [polling, setPolling] = useState(false);

  const amount = courseFee || 1000;
  const formattedAmount = amount.toLocaleString();

  const handleInitiate = async () => {
    setError('');
    if (method === 'momo' && !phone.trim()) {
      setError('Please enter your MoMo phone number.');
      return;
    }
    if (method === 'momo') {
      const cleaned = phone.replace(/\s/g, '');
      if (!/^07\d{8}$/.test(cleaned)) {
        setError('Please enter a valid MTN MoMo number (e.g. 0780505948).');
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ courseId, method, phone: phone.trim() }),
      }, 30000);
      const data = await res.json().catch(() => null);
      if (!data) {
        const text = await res.text().catch(() => '');
        console.error('Payment API error:', res.status, text.slice(0, 300));
        setError(`Server error (${res.status}). Please try again.`);
        setLoading(false);
        return;
      }

      if (data.status === 'already_paid') {
        setSuccess(true);
        setTimeout(() => onPaid(), 1500);
        setLoading(false);
        return;
      }

      if (data.status === 'redirect' && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      if (data.status === 'pending') {
        setPolling(true);
        pollPayment(data.txRef);
        return;
      }

      setError(data.error || 'Payment failed.');
    } catch (e) {
      const msg = e.name === 'AbortError'
        ? 'Server is waking up, please try again in 30 seconds.'
        : 'Network error. Please try again.';
      setError(msg);
    }
    setLoading(false);
  };

  const pollPayment = async (txRef) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 30) {
        clearInterval(interval);
        setPolling(false);
        setError('Payment timed out. Please check your phone and try again.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/payments/verify/${txRef}`, {
          headers: { Authorization: `Bearer ${token()}` },
        }, 15000);
        const data = await res.json();
        if (data.status === 'successful') {
          clearInterval(interval);
          setPolling(false);
          setSuccess(true);
          setTimeout(() => onPaid(), 1500);
        }
      } catch { /* ignore */ }
    }, 5000);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-emerald-500" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Payment Successful!</h3>
          <p className="text-sm text-slate-500">Your certificate is ready to download.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Certificate Payment</h3>
            <p className="text-xs text-slate-500 mt-0.5">{courseTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <FaTimes className="text-slate-400" size={14} />
          </button>
        </div>

        <div className="p-5">
          <div className="bg-slate-50 rounded-xl p-4 mb-5 text-center">
            <p className="text-xs text-slate-500 mb-1">Amount to Pay</p>
            <p className="text-2xl font-black text-slate-900">{formattedAmount} <span className="text-sm font-bold text-slate-500">RWF</span></p>
          </div>

          {!method && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center mb-2">Choose Payment Method</p>
              <button onClick={() => setMethod('momo')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FaMobileAlt className="text-amber-600" size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">MTN Mobile Money</p>
                  <p className="text-xs text-slate-500">Pay with your MoMo wallet</p>
                </div>
              </button>
              <button onClick={() => setMethod('card')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaCreditCard className="text-blue-600" size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">Credit / Debit Card</p>
                  <p className="text-xs text-slate-500">Visa, Mastercard, etc.</p>
                </div>
              </button>
            </div>
          )}

          {method === 'momo' && !polling && (
            <div className="space-y-3">
              <button onClick={() => setMethod(null)} className="text-xs text-slate-400 hover:text-slate-600 mb-2">&larr; Back</button>
              <label className="block text-xs font-semibold text-slate-700">MTN MoMo Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
              <p className="text-[10px] text-slate-400">Enter your MTN MoMo number (e.g. 0780505948)</p>
              <button onClick={handleInitiate} disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-sm font-bold hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><FaSpinner className="animate-spin" /> Processing...</> : `Pay ${formattedAmount} RWF`}
              </button>
            </div>
          )}

          {method === 'card' && !polling && (
            <div className="space-y-3">
              <button onClick={() => setMethod(null)} className="text-xs text-slate-400 hover:text-slate-600 mb-2">&larr; Back</button>
              <p className="text-xs text-slate-500 text-center">You will be redirected to a secure card payment page.</p>
              <button onClick={handleInitiate} disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><FaSpinner className="animate-spin" /> Redirecting...</> : 'Pay with Card'}
              </button>
            </div>
          )}

          {polling && (
            <div className="text-center py-6">
              <FaSpinner className="animate-spin text-amber-500 mx-auto mb-3" size={32} />
              <p className="text-sm font-bold text-slate-900 mb-1">Waiting for payment confirmation...</p>
              <p className="text-xs text-slate-500">Please check your phone and enter your PIN.</p>
              <p className="text-xs text-slate-400 mt-2">This may take a few minutes.</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl mt-4 border border-red-200">
              <FaExclamationCircle className="text-red-500 shrink-0" size={14} />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
