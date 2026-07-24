import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { FaCheckCircle, FaSpinner, FaHighlighter, FaPrint, FaMinus, FaPlus, FaTimes,
  FaBookOpen, FaVideo, FaPlay, FaLink, FaFileAlt, FaExternalLinkAlt,
  FaClipboardCheck, FaAward, FaClock, FaLock,
} from 'react-icons/fa';
import Certificate from './Certificate';

function useReadingTimer(readingTime, lessonId, onExpired) {
  const [remaining, setRemaining] = useState(0);
  const firedRef = useRef(false);
  const remainingRef = useRef(0);

  useEffect(() => {
    firedRef.current = false;
    if (!readingTime) { setRemaining(0); return; }
    const match = readingTime.match(/(\d+)/);
    const minutes = match ? parseInt(match[1], 10) : 0;
    if (minutes <= 0) { setRemaining(0); return; }

    const totalSeconds = minutes * 60;
    const storageKey = `cshub-timer-${lessonId}`;

    let initialRemaining = totalSeconds;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && typeof saved.remaining === 'number') {
        initialRemaining = saved.remaining;
      }
    } catch { /* ignore */ }

    remainingRef.current = initialRemaining;
    setRemaining(initialRemaining);

    if (initialRemaining <= 0) {
      try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
      if (!firedRef.current && onExpired) {
        firedRef.current = true;
        setTimeout(() => onExpired(), 300);
      }
      return;
    }

    const tick = () => {
      remainingRef.current -= 1;
      const next = remainingRef.current;
      try {
        localStorage.setItem(storageKey, JSON.stringify({ remaining: next }));
      } catch { /* ignore */ }
      if (next <= 0) {
        clearInterval(interval);
        try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
        if (!firedRef.current && onExpired) {
          firedRef.current = true;
          setTimeout(() => onExpired(), 300);
        }
        setRemaining(0);
        return;
      }
      setRemaining(next);
    };

    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [readingTime, lessonId]);

  return remaining;
}

function LessonCard({ moduleName, title, readingTime, isComplete, icon: Icon, children, footer }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-fade-in relative z-0">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-4 py-3 rounded-t-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-amber-400 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-blue-400 blur-2xl" />
        </div>
        <div className="relative">
          {moduleName && (
            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{moduleName}</div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {Icon && (
                <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-white" />
                </div>
              )}
              <h2 className="text-sm font-bold text-white truncate">{title}</h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {readingTime && (
                <span className="inline-flex items-center gap-1 text-[9px] text-slate-300">
                  <FaBookOpen size={8} /> {readingTime}
                </span>
              )}
              {isComplete && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">
                  <FaCheckCircle size={8} /> Done
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {children}
      </div>

      {footer && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
}

function ReadingTools({ highlightMode, setHighlightMode, textSize, setTextSize, onPrint, highlightCount, onClearHighlights }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap pb-4 mb-4 border-b border-slate-100">
      <button
        onClick={() => setHighlightMode(!highlightMode)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${
          highlightMode
            ? 'bg-amber-400 border-amber-500 text-white shadow-sm shadow-amber-200'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-200'
        }`}
      >
        <FaHighlighter size={9} className={highlightMode ? 'text-white' : 'text-amber-500'} />
        Highlight {highlightMode ? 'ON' : 'OFF'}
      </button>

      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden">
        <button
          onClick={() => setTextSize(s => Math.max(12, s - 2))}
          className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer border-r border-slate-200"
        >
          <FaMinus size={8} />
        </button>
        <span className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 min-w-[2.5rem] text-center tabular-nums">{textSize}px</span>
        <button
          onClick={() => setTextSize(s => Math.min(24, s + 2))}
          className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer border-l border-slate-200"
        >
          <FaPlus size={8} />
        </button>
      </div>

      <button
        onClick={onPrint}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
      >
        <FaPrint size={9} className="text-slate-400" /> Print
      </button>

      {highlightCount > 0 && (
        <button
          onClick={onClearHighlights}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-[11px] font-medium text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
        >
          <FaTimes size={8} /> Clear ({highlightCount})
        </button>
      )}
    </div>
  );
}

function MarkCompleteButton({ isComplete, onMark, marking, markKey, disabled, remainingTime }) {
  if (isComplete) {
    return (
      <div className="flex items-center gap-2 text-emerald-600">
        <FaCheckCircle size={14} />
        <span className="text-sm font-semibold">Completed</span>
      </div>
    );
  }

  if (disabled && remainingTime > 0) {
    const mins = Math.floor(remainingTime / 60);
    const secs = remainingTime % 60;
    return (
      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-medium cursor-not-allowed select-none">
        <FaClock size={12} />
        Wait {mins > 0 ? `${mins}m ` : ''}{secs}s to mark complete
      </div>
    );
  }

  return (
    <button
      onClick={onMark}
      disabled={marking === markKey}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 rounded-xl text-xs font-bold hover:from-amber-500 hover:to-yellow-500 transition-all shadow-sm shadow-amber-200/50 disabled:opacity-60 cursor-pointer"
    >
      {marking === markKey ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
      Mark as Complete
    </button>
  );
}

function OverviewLesson({ lesson, course, moduleName, progress, marking, onMark }) {
  const remaining = useReadingTimer(lesson.readingTime, lesson.id);

  useEffect(() => {
    if (lesson.completed) {
      try { localStorage.removeItem(`cshub-timer-${lesson.id}`); } catch { /* ignore */ }
    }
  }, [lesson.completed, lesson.id]);

  return (
    <LessonCard
      moduleName={moduleName}
      title="Course Overview"
      isComplete={lesson.completed}
      icon={FaBookOpen}
      footer={
        <MarkCompleteButton
          isComplete={lesson.completed}
          onMark={() => onMark('content')}
          marking={marking}
          markKey="overview-content"
          disabled={!lesson.completed && remaining > 0}
          remainingTime={remaining}
        />
      }
    >
      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{lesson.description}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        {[
          { label: 'Category', value: course.category, capitalize: true },
          { label: 'Difficulty', value: course.difficulty, capitalize: true },
          { label: 'Duration', value: course.estimatedTime || 'Self-paced' },
          { label: 'Author', value: course.author },
        ].map(item => (
          <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">{item.label}</div>
            <div className={`text-xs font-bold text-slate-700 ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</div>
          </div>
        ))}
      </div>
    </LessonCard>
  );
}

function IntroVideoLesson({ lesson, moduleName, progress, marking, onMark }) {
  return (
    <LessonCard
      moduleName={moduleName}
      title="Introduction Video"
      isComplete={lesson.completed}
      icon={FaPlay}
      footer={
        <MarkCompleteButton
          isComplete={lesson.completed}
          onMark={() => onMark('introVideo')}
          marking={marking}
          markKey="introVideo"
        />
      }
    >
      <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-lg">
        <iframe
          src={lesson.videoUrl?.includes('embed') ? lesson.videoUrl : lesson.videoUrl?.replace('watch?v=', 'embed/')}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Introduction Video"
        />
      </div>
    </LessonCard>
  );
}

function ContentLesson({ lesson, moduleName, marking, markLessonLocal, highlights, setHighlights, highlightKey, onAutoNext }) {
  const [highlightMode, setHighlightMode] = useState(false);
  const [textSize, setTextSize] = useState(15);
  const contentRef = useRef(null);
  const remaining = useReadingTimer(lesson.readingTime, lesson.id, () => {
    if (!lesson.completed) {
      markLessonLocal(lesson.id, lesson.type);
      if (onAutoNext) setTimeout(() => onAutoNext(), 500);
    }
  });

  useEffect(() => {
    if (lesson.completed) {
      try { localStorage.removeItem(`cshub-timer-${lesson.id}`); } catch { /* ignore */ }
    }
  }, [lesson.completed, lesson.id]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(highlightKey);
      if (saved) setHighlights(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [highlightKey, setHighlights]);

  useEffect(() => {
    localStorage.setItem(highlightKey, JSON.stringify(highlights));
  }, [highlights, highlightKey]);

  useEffect(() => {
    const style = document.getElementById('highlight-style') || document.createElement('style');
    style.id = 'highlight-style';
    style.textContent = highlightMode
      ? '.lesson-prose ::selection { background: #fef08a; } .lesson-prose mark[data-highlight] { background: #fef08a; cursor: pointer; padding: 1px 0; border-radius: 2px; }'
      : '.lesson-prose mark[data-highlight] { background: #fef08a; cursor: pointer; padding: 1px 0; border-radius: 2px; }';
    if (!document.getElementById('highlight-style')) document.head.appendChild(style);
    return () => { if (style.parentNode) style.remove(); };
  }, [highlightMode]);

  useEffect(() => {
    const prose = contentRef.current;
    if (!prose) return;
    prose.querySelectorAll('mark[data-highlight]').forEach(el => el.replaceWith(document.createTextNode(el.textContent)));
    highlights.forEach(h => {
      const walker = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const idx = node.textContent.indexOf(h.text);
        if (idx !== -1 && node.parentElement && !node.parentElement.closest('mark[data-highlight]')) {
          const range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + h.text.length);
          const mark = document.createElement('mark');
          mark.setAttribute('data-highlight', h.id);
          mark.style.background = '#fef08a';
          mark.style.cursor = 'pointer';
          mark.style.padding = '1px 0';
          mark.style.borderRadius = '2px';
          mark.title = 'Click to remove highlight';
          mark.addEventListener('click', () => setHighlights(prev => prev.filter(x => x.id !== h.id)));
          range.surroundContents(mark);
          break;
        }
      }
    });
  }, [highlights, setHighlights]);

  useEffect(() => {
    if (!highlightMode) return;
    const handleMouseUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
      if (!contentRef.current || !contentRef.current.contains(sel.anchorNode)) return;
      const text = sel.toString().trim();
      if (!text || highlights.some(h => h.text === text)) return;
      setHighlights(prev => [...prev, { id: Date.now().toString(), text }]);
      sel.removeAllRanges();
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [highlightMode, highlights, setHighlights]);

  const handlePrint = useCallback(() => {
    if (!contentRef.current) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>${lesson.title}</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.8;color:#1e293b;}h1,h2,h3{margin-top:1.5rem;}ul,ol{padding-left:1.5rem;}li{margin:0.3rem 0;}code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:0.9em;}pre{background:#1e293b;color:#e2e8f0;padding:1rem;border-radius:8px;overflow-x:auto;}</style></head><body>`);
    win.document.write(`<h1>${lesson.title}</h1><hr style="margin:1rem 0;border:none;border-top:1px solid #e2e8f0;">`);
    win.document.write(contentRef.current.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  }, [lesson.title]);

  return (
    <LessonCard
      moduleName={moduleName}
      title={lesson.title}
      readingTime={lesson.readingTime}
      isComplete={lesson.completed}
      icon={FaBookOpen}
      footer={
        <MarkCompleteButton
          isComplete={lesson.completed}
          onMark={() => markLessonLocal(lesson.id, lesson.type)}
          marking={marking}
          markKey={lesson.id}
          disabled={!lesson.completed && remaining > 0}
          remainingTime={remaining}
        />
      }
    >
      <ReadingTools
        highlightMode={highlightMode}
        setHighlightMode={setHighlightMode}
        textSize={textSize}
        setTextSize={setTextSize}
        onPrint={handlePrint}
        highlightCount={highlights.length}
        onClearHighlights={() => setHighlights([])}
      />

      <div
        ref={contentRef}
        className="lesson-prose prose prose-slate prose-headings:scroll-mt-28 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-800 prose-code:text-amber-700 prose-code:bg-amber-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-normal prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-img:rounded-xl prose-img:shadow-md max-w-none"
        style={{ fontSize: `${textSize}px` }}
      >
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{lesson.markdownContent}</ReactMarkdown>
      </div>
    </LessonCard>
  );
}

function VideoLesson({ lesson, moduleName, progress, marking, onMark }) {
  return (
    <LessonCard
      moduleName={moduleName}
      title="Course Video"
      isComplete={lesson.completed}
      icon={FaVideo}
      footer={
        <MarkCompleteButton
          isComplete={lesson.completed}
          onMark={() => onMark('video')}
          marking={marking}
          markKey="video"
        />
      }
    >
      <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-lg">
        <iframe
          src={lesson.videoUrl?.includes('embed') ? lesson.videoUrl : lesson.videoUrl?.replace('watch?v=', 'embed/')}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Course Video"
        />
      </div>
    </LessonCard>
  );
}

function ResourceLesson({ lesson, moduleName, progress, marking, onMark }) {
  const res = lesson.resource;
  const ICON_MAP = { video: FaVideo, file: FaFileAlt };
  const COLOR_MAP = { video: 'text-red-500', file: 'text-blue-500' };
  const Icon = ICON_MAP[res.type] || FaLink;
  const color = COLOR_MAP[res.type] || 'text-slate-500';

  return (
    <LessonCard
      moduleName={moduleName}
      title={res.title}
      isComplete={lesson.completed}
      icon={Icon}
      footer={
        <MarkCompleteButton
          isComplete={lesson.completed}
          onMark={() => onMark('resource', res._id)}
          marking={marking}
          markKey={`resource-${res._id}`}
        />
      }
    >
      {res.description && (
        <p className="text-sm text-slate-500 leading-relaxed mb-4">{res.description}</p>
      )}

      {res.url && (
        <a
          href={res.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all"
        >
          <FaExternalLinkAlt size={13} />
          Open Resource
        </a>
      )}
    </LessonCard>
  );
}

function AssessmentLesson({ lesson, course, moduleName, onShowAssessment }) {
  return (
    <LessonCard
      moduleName={moduleName}
      title="Course Assessment"
      isComplete={lesson.completed}
      icon={FaClipboardCheck}
    >
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center shadow-lg ${lesson.completed ? 'bg-gradient-to-br from-emerald-400 to-green-500' : 'bg-gradient-to-br from-slate-700 to-slate-800'}`}>
          {lesson.completed ? <FaCheckCircle size={22} className="text-white" /> : <FaClipboardCheck size={22} className="text-white" />}
        </div>
        {lesson.locked ? (
          <>
            <p className="text-xs text-slate-500 mb-3 max-w-md mx-auto leading-relaxed">
              Complete all course content lessons before taking the assessment.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-medium cursor-not-allowed select-none">
              <FaLock size={11} /> Locked — finish all lessons first
            </div>
          </>
        ) : lesson.completed ? (
          <>
            <p className="text-xs text-emerald-600 mb-3 font-semibold">
              You passed the assessment!
            </p>
            <div className="inline-flex items-center gap-2 text-emerald-600">
              <FaCheckCircle size={14} />
              <span className="text-sm font-semibold">Assessment Passed</span>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto leading-relaxed">
              Test your knowledge with a {course.category || 'general'} assessment.
              You need 70% to pass and earn your certificate.
            </p>
            <button
              onClick={onShowAssessment}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 rounded-xl text-xs font-bold hover:from-amber-500 hover:to-yellow-500 transition-all shadow-lg shadow-amber-200/50 cursor-pointer"
            >
              <FaClipboardCheck /> Start Assessment
            </button>
          </>
        )}
      </div>
    </LessonCard>
  );
}

function CertificateLesson({ lesson, moduleName, course, userName, curriculum, userId, assessmentPassed, assessmentScore, completedAt }) {
  if (!lesson.completed) {
    return (
      <LessonCard
        moduleName={moduleName}
        title="Course Certificate"
        isComplete={false}
        icon={FaAward}
      >
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <FaAward size={22} className="text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto leading-relaxed">
            Complete the course and pass the assessment to earn your certificate of completion.
          </p>
          <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 max-w-sm mx-auto">
            Complete the course and assessment to earn your certificate.
          </div>
        </div>
      </LessonCard>
    );
  }

  return (
    <Certificate
      course={course}
      userName={userName}
      userId={userId}
      curriculum={curriculum}
      assessmentPassed={assessmentPassed}
      assessmentScore={assessmentScore}
      completedAt={completedAt}
    />
  );
}

export default function LessonContent({ lesson, course, progress, marking, onMark, onShowAssessment, markLessonLocal, moduleName, onAutoNext, userName, curriculum, userId, assessmentPassed, assessmentScore }) {
  const [highlights, setHighlights] = useState([]);
  const highlightKey = `course-lesson-${lesson?.id || 'unknown'}`;

  if (!lesson) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <FaBookOpen size={24} className="mr-2" /> Select a lesson to begin
      </div>
    );
  }

  switch (lesson.type) {
    case 'overview':
      return <OverviewLesson lesson={lesson} course={course} moduleName={moduleName} progress={progress} marking={marking} onMark={onMark} />;
    case 'intro-video':
      return <IntroVideoLesson lesson={lesson} moduleName={moduleName} progress={progress} marking={marking} onMark={onMark} />;
    case 'content':
      return (
        <ContentLesson
          lesson={lesson}
          moduleName={moduleName}
          marking={marking}
          markLessonLocal={markLessonLocal}
          highlights={highlights}
          setHighlights={setHighlights}
          highlightKey={highlightKey}
          onAutoNext={onAutoNext}
        />
      );
    case 'video':
      return <VideoLesson lesson={lesson} moduleName={moduleName} progress={progress} marking={marking} onMark={onMark} />;
    case 'resource':
      return <ResourceLesson lesson={lesson} moduleName={moduleName} progress={progress} marking={marking} onMark={onMark} />;
    case 'assessment':
      return <AssessmentLesson lesson={lesson} course={course} moduleName={moduleName} onShowAssessment={onShowAssessment} />;
    case 'certificate':
      return (
        <CertificateLesson
          lesson={lesson}
          moduleName={moduleName}
          course={course}
          userName={userName}
          curriculum={curriculum}
          userId={userId}
          assessmentPassed={assessmentPassed}
          assessmentScore={assessmentScore}
          completedAt={progress?.completedAt}
        />
      );
    default:
      return null;
  }
}
