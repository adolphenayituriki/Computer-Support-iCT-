import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export default function LessonNavigation({ prevLesson, nextLesson, onSelectLesson }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
      {prevLesson ? (
        <button
          onClick={() => onSelectLesson(prevLesson.id)}
          className="group flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-200 text-left hover:bg-slate-50 hover:border-slate-300 transition-all max-w-[48%]"
        >
          <FaArrowLeft size={10} className="text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors" />
          <div className="min-w-0">
            <div className="text-[9px] font-medium text-slate-400 uppercase tracking-wide">Previous</div>
            <div className="text-[11px] font-semibold text-slate-700 truncate">{prevLesson.title}</div>
          </div>
        </button>
      ) : <div />}

      {nextLesson ? (
        <button
          onClick={() => onSelectLesson(nextLesson.id)}
          className="group flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-200 text-right hover:bg-slate-50 hover:border-slate-300 transition-all max-w-[48%]"
        >
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-medium text-slate-400 uppercase tracking-wide">Next</div>
            <div className="text-[11px] font-semibold text-slate-700 truncate">{nextLesson.title}</div>
          </div>
          <FaArrowRight size={10} className="text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors" />
        </button>
      ) : <div />}
    </div>
  );
}
