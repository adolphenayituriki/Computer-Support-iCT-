import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaEye, FaSpinner, FaSearch, FaFilter, FaImage } from 'react-icons/fa';
import { cn } from '../lib/utils';
import { useToast } from '../ToastContext';
import API_BASE from '../api';

const token = () => localStorage.getItem('cshub_token');

function apiFetch(url, opts = {}) {
  return fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...opts.headers },
    ...opts,
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) return { error: data.error || `Request failed (${r.status})` };
    return data;
  });
}

const STATUS_COLORS = {
  pending_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

function ReceiptModal({ payment, onClose, onApprove, onReject }) {
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(payment._id, adminNote);
    setLoading(false);
    onClose();
  };

  const handleReject = async () => {
    setLoading(true);
    await onReject(payment._id, adminNote);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-bold text-slate-900">Payment Review</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200">&times;</button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Student</p>
              <p className="text-slate-800 font-semibold">{payment.userId?.name || 'N/A'}</p>
              <p className="text-slate-500">{payment.userId?.email || ''}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Course</p>
              <p className="text-slate-800 font-semibold">{payment.courseId?.title || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Amount</p>
              <p className="text-slate-800 font-bold">{payment.amount?.toLocaleString()} {payment.currency}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Reference</p>
              <p className="text-slate-800 font-mono text-[11px]">{payment.txRef}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Phone</p>
              <p className="text-slate-800">{payment.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Status</p>
              <span className={cn('inline-flex items-center rounded-full px-2 py-px text-[10px] font-semibold', STATUS_COLORS[payment.status])}>{payment.status?.replace('_', ' ')}</span>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Submitted</p>
              <p className="text-slate-800">{new Date(payment.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {payment.receiptImage && (
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Receipt / Screenshot</p>
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <img src={payment.receiptImage} alt="Payment receipt" className="w-full max-h-[400px] object-contain" />
              </div>
            </div>
          )}

          {!payment.receiptImage && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <FaImage className="mx-auto mb-2 text-slate-300" size={24} />
              <p className="text-xs text-slate-400">No receipt uploaded</p>
            </div>
          )}

          {payment.status === 'pending_review' && (
            <>
              <div>
                <label className="text-[10px] uppercase font-semibold text-slate-400">Admin Note (optional)</label>
                <textarea
                  rows="2"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none resize-none focus:border-slate-900 mt-1"
                  placeholder="Add a note..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleApprove} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">
                  {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Approve
                </button>
                <button onClick={handleReject} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-500 py-2.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                  {loading ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />} Reject
                </button>
              </div>
            </>
          )}

          {payment.adminNote && (
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <p className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5">Admin Note</p>
              <p className="text-xs text-slate-600">{payment.adminNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPayments() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detailPayment, setDetailPayment] = useState(null);

  const fetchPayments = () => {
    setLoading(true);
    apiFetch('/api/admin/payments')
      .then((d) => { setPayments(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleApprove = async (id, adminNote) => {
    const res = await apiFetch(`/api/admin/payments/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ adminNote }),
    });
    if (res.error) return showToast(res.error, 'error');
    setPayments((prev) => prev.map((p) => (p._id === id ? { ...p, status: 'approved', adminNote, reviewedAt: new Date() } : p)));
    showToast('Payment approved.');
  };

  const handleReject = async (id, adminNote) => {
    const res = await apiFetch(`/api/admin/payments/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ adminNote }),
    });
    if (res.error) return showToast(res.error, 'error');
    setPayments((prev) => prev.map((p) => (p._id === id ? { ...p, status: 'rejected', adminNote, reviewedAt: new Date() } : p)));
    showToast('Payment rejected.');
  };

  const filtered = payments.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.userId?.name?.toLowerCase().includes(q) ||
        p.userId?.email?.toLowerCase().includes(q) ||
        p.courseId?.title?.toLowerCase().includes(q) ||
        p.txRef?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = payments.filter((p) => p.status === 'pending_review').length;
  const approvedCount = payments.filter((p) => p.status === 'approved').length;
  const rejectedCount = payments.filter((p) => p.status === 'rejected').length;
  const totalRevenue = payments.filter((p) => p.status === 'approved').reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-4 animate-in fade-in">
      {detailPayment && (
        <ReceiptModal
          payment={detailPayment}
          onClose={() => setDetailPayment(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'Pending Review', value: pendingCount, color: 'text-amber-500' },
          { label: 'Approved', value: approvedCount, color: 'text-emerald-500' },
          { label: 'Rejected', value: rejectedCount, color: 'text-red-500' },
          { label: 'Revenue', value: `${totalRevenue.toLocaleString()} RWF`, color: 'text-sky-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className={cn('text-lg font-extrabold', s.color)}>{s.value}</div>
            <div className="text-[10px] font-medium text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 h-8 flex-1 sm:w-56">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input type="text" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" />
          </div>
          <div className="flex gap-1">
            {['all', 'pending_review', 'approved', 'rejected'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors', filter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50')}>
                {f === 'pending_review' ? 'Pending' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16">
          <FaSearch className="mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No payments found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p._id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn('inline-flex items-center rounded-full px-2 py-px text-[10px] font-semibold', STATUS_COLORS[p.status])}>
                      {p.status?.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{p.amount?.toLocaleString()} {p.currency}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{p.userId?.name || 'Unknown'} <span className="text-slate-400 font-normal">({p.userId?.email || ''})</span></p>
                  <p className="text-[11px] text-slate-500">Course: {p.courseId?.title || 'N/A'}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400">
                    <span className="font-mono">{p.txRef}</span>
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    {p.phone && <span>{p.phone}</span>}
                  </div>
                </div>
                <button
                  onClick={() => setDetailPayment(p)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 shrink-0"
                >
                  <FaEye /> Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
