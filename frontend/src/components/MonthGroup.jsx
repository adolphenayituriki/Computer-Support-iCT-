import { cn } from '../lib/utils';

export function monthLabel(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function groupByMonth(items, getDate = (it) => it.createdAt) {
  const map = new Map();
  for (const item of items) {
    const label = monthLabel(getDate(item));
    if (!map.has(label)) map.set(label, []);
    map.get(label).push(item);
  }
  return Array.from(map.entries()).map(([label, list]) => ({ label, list }));
}

export function MonthHeader({ label, count }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <span className={cn('flex h-5 min-w-5 items-center justify-center rounded-full border border-cshub-blue/20 bg-cshub-blue/10 px-1.5 text-[10px] font-semibold text-cshub-blue')}>{count}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export function MonthFilter({ items, value, onChange, getDate = (it) => it.createdAt }) {
  const months = Array.from(new Set(items.map((it) => monthLabel(getDate(it))).filter(Boolean)));
  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        onClick={() => onChange('all')}
        className={cn('rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors', value === 'all' ? 'bg-cshub-blue text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50')}
      >
        All Months
      </button>
      {months.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn('rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors', value === m ? 'bg-cshub-blue text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50')}
        >
          {m}
        </button>
      ))}
    </div>
  );
}