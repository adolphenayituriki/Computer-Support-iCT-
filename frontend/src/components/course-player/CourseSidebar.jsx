import { useRef, useEffect, useMemo } from 'react';
import { FaCheckCircle, FaLock, FaPlay, FaChevronDown, FaChevronRight, FaBookOpen, FaVideo, FaLink, FaClipboardCheck, FaAward } from 'react-icons/fa';
import { cn } from '../../lib/utils';

const LESSON_ICONS = {
  'overview': FaBookOpen,
  'intro-video': FaPlay,
  'content': FaBookOpen,
  'video': FaVideo,
  'resource': FaLink,
  'assessment': FaClipboardCheck,
  'certificate': FaAward,
};

function LessonStatusIcon({ lesson, isActive }) {
  if (lesson.completed) {
    return (
      <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
        <FaCheckCircle size={10} />
      </span>
    );
  }
  if (lesson.locked) {
    return (
      <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
        <FaLock size={8} />
      </span>
    );
  }
  const Icon = LESSON_ICONS[lesson.type] || FaBookOpen;
  return (
    <span className={cn(
      'h-5 w-5 rounded-full flex items-center justify-center shrink-0',
      isActive ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
    )}>
      <Icon size={9} />
    </span>
  );
}

export default function CourseSidebar({ course, curriculum, progress, activeLessonId, expandedModules, onToggleModule, onSelectLesson }) {
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeLessonId]);

  const courseProgress = curriculum.totalLessons > 0
    ? Math.round((curriculum.completedLessons / curriculum.totalLessons) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-5 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-4">{course.title}</h2>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-500">Progress</span>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: courseProgress >= 100 ? '#10b981' : '#FFCE08' }}>
              {courseProgress}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${courseProgress}%`,
                background: courseProgress >= 100 ? '#10b981' : 'linear-gradient(90deg, #FFCE08, #f59e0b)',
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-lg px-2.5 py-2 text-center">
            <div className="text-[10px] text-slate-400 font-medium">Modules</div>
            <div className="text-sm font-bold text-slate-700">{curriculum.modules.length}</div>
          </div>
          <div className="bg-slate-50 rounded-lg px-2.5 py-2 text-center">
            <div className="text-[10px] text-slate-400 font-medium">Lessons</div>
            <div className="text-sm font-bold text-slate-700">{curriculum.totalLessons}</div>
          </div>
          <div className="bg-slate-50 rounded-lg px-2.5 py-2 text-center">
            <div className="text-[10px] text-slate-400 font-medium">Done</div>
            <div className="text-sm font-bold text-emerald-600">{curriculum.completedLessons}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Curriculum</div>

          {curriculum.modules.map((mod) => {
            const isExpanded = expandedModules.has(mod.id);
            const hasActiveLesson = mod.lessons.some(l => l.id === activeLessonId);
            const visibleLessons = mod.lessons.filter(l => !l.hidden);
            const completedInModule = visibleLessons.filter(l => l.completed).length;

            if (visibleLessons.length === 0) return null;

            return (
              <div key={mod.id} className="mb-0.5">
                <button
                  onClick={() => onToggleModule(mod.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-left transition-colors group',
                    hasActiveLesson ? 'bg-amber-50/80' : 'hover:bg-slate-50'
                  )}
                >
                  <span className={cn('text-slate-400 shrink-0 transition-transform', isExpanded && 'rotate-0')}>
                    {isExpanded ? <FaChevronDown size={9} /> : <FaChevronRight size={9} />}
                  </span>
                  <span className={cn(
                    'text-xs font-semibold flex-1 min-w-0 truncate',
                    hasActiveLesson ? 'text-amber-700' : 'text-slate-700 group-hover:text-slate-900'
                  )}>
                    {mod.title}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 tabular-nums shrink-0">
                    {completedInModule}/{visibleLessons.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="ml-2 pl-3 border-l border-slate-100 mb-1">
                    {visibleLessons.map((lesson) => {
                      const isActive = lesson.id === activeLessonId;
                      const isCompleted = lesson.completed;
                      const isLocked = lesson.locked;

                      return (
                        <button
                          key={lesson.id}
                          ref={isActive ? activeRef : null}
                          onClick={() => !isLocked && onSelectLesson(lesson.id)}
                          disabled={isLocked}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all group/lesson',
                            isActive && 'bg-amber-50 border-l-2 border-amber-400 -ml-[1px]',
                            !isActive && 'border-l-2 border-transparent -ml-[1px]',
                            !isActive && !isLocked && 'hover:bg-slate-50',
                            isLocked && 'opacity-40 cursor-not-allowed'
                          )}
                        >
                          <LessonStatusIcon lesson={lesson} isActive={isActive} />
                          <span className={cn(
                            'text-xs truncate flex-1 min-w-0',
                            isActive && 'font-semibold text-amber-700',
                            !isActive && isCompleted && 'text-slate-500',
                            !isActive && !isCompleted && 'text-slate-600 group-hover/lesson:text-slate-800'
                          )}>
                            {lesson.title}
                          </span>
                          {lesson.readingTime && !isActive && (
                            <span className="text-[9px] font-medium text-slate-300 shrink-0 tabular-nums">{lesson.readingTime}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
