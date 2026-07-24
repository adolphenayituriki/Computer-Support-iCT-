import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';
import { useToast } from '../../ToastContext';
import API_BASE from '../../api';
import Assessment from '../Assessment';
import useCourseCurriculum, { getCompletedLessonIds, markLessonComplete } from './useCourseCurriculum';
import useAutoComplete from './useAutoComplete';
import CourseSidebar from './CourseSidebar';
import CourseHeader from './CourseHeader';
import LessonContent from './LessonContent';
import LessonNavigation from './LessonNavigation';
import MobileSidebar from './MobileSidebar';

function token() { return localStorage.getItem('cshub_token'); }

function CompletionBanner({ onShowAssessment }) {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-3 mb-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
          <FaCheckCircle size={16} className="text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-emerald-900">Course Completed!</h3>
          <p className="text-[11px] text-emerald-600">Congratulations! You have completed all lessons.</p>
        </div>
        <button
          onClick={onShowAssessment}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 rounded-lg text-[10px] font-bold hover:from-amber-500 hover:to-yellow-500 transition-all shadow-sm cursor-pointer"
        >
          Take Assessment
        </button>
      </div>
    </div>
  );
}

function CourseInfoPanel({ course }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5">
      <div className="flex items-center gap-4 flex-wrap text-[10px]">
        {[
          ['Author', course.author],
          ['Category', course.category, true],
          ['Difficulty', course.difficulty, true],
          course.estimatedTime && ['Duration', course.estimatedTime],
          ['Published', new Date(course.createdAt).toLocaleDateString()],
        ].filter(Boolean).map(([label, value, cap]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">{label}</span>
            <span className={`font-semibold text-slate-700 ${cap ? 'capitalize' : ''}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const DEFAULT_EXPANDED = new Set(['introduction']);

export default function CoursePlayer() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [expandedModules, setExpandedModules] = useState(DEFAULT_EXPANDED);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(() => getCompletedLessonIds(id));
  const [assessmentPassed, setAssessmentPassed] = useState(() => {
    try { return localStorage.getItem(`cshub-assessment-${id}`) === 'true'; } catch { return false; }
  });
  const [assessmentFinalized, setAssessmentFinalized] = useState(() => {
    try { return localStorage.getItem(`cshub-assessment-finalized-${id}`) === 'true'; } catch { return false; }
  });
  const [assessmentScore, setAssessmentScore] = useState(() => {
    try { return parseInt(localStorage.getItem(`cshub-assessment-score-${id}`) || '0', 10); } catch { return 0; }
  });

  const syncToBackend = useCallback((section, resourceId) => {
    if (!user) return;
    fetch(`${API_BASE}/api/enrollments/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ section, resourceId }),
    }).then(r => r.json()).then(data => {
      if (data.progress !== undefined) setProgress(prev => ({ ...prev, ...data }));
    }).catch(() => {});
  }, [id, user]);

  const markLessonLocal = useCallback((lessonId, lessonType, resourceId) => {
    markLessonComplete(id, lessonId);
    setCompletedLessons(getCompletedLessonIds(id));

    const sectionMap = {
      'overview': 'content',
      'content': 'content',
      'intro-video': 'introVideo',
      'video': 'video',
      'resource': 'resource',
    };
    const section = sectionMap[lessonType];
    if (section) syncToBackend(section, resourceId);
  }, [id, syncToBackend]);

  const markAssessmentPassed = useCallback(() => {
    localStorage.setItem(`cshub-assessment-${id}`, 'true');
    setAssessmentPassed(true);
  }, [id]);

  const markAssessmentFinalized = useCallback(() => {
    localStorage.setItem(`cshub-assessment-finalized-${id}`, 'true');
    setAssessmentFinalized(true);
  }, [id]);

  const curriculum = useCourseCurriculum(course, progress, completedLessons, assessmentPassed, assessmentFinalized);

  const allLessons = useMemo(
    () => curriculum.modules.flatMap(m => m.lessons),
    [curriculum.modules]
  );

  const activeLesson = useMemo(
    () => allLessons.find(l => l.id === activeLessonId) || allLessons[0],
    [allLessons, activeLessonId]
  );

  const activeLessonIndex = allLessons.findIndex(l => l.id === activeLesson?.id);
  const prevLesson = activeLessonIndex > 0 ? allLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex >= 0 && activeLessonIndex < allLessons.length - 1 ? allLessons[activeLessonIndex + 1] : null;

  useEffect(() => {
    if (!activeLesson) return;
    const mod = curriculum.modules.find(m => m.lessons.some(l => l.id === activeLesson.id));
    if (mod) {
      setExpandedModules(prev => {
        if (prev.has(mod.id)) return prev;
        return new Set([...prev, mod.id]);
      });
    }
  }, [activeLesson, curriculum.modules]);

  useEffect(() => {
    if (!activeLessonId && allLessons.length > 0) {
      const firstIncomplete = allLessons.find(l => !l.completed && !l.locked);
      setActiveLessonId(firstIncomplete?.id || allLessons[0].id);
    }
  }, [activeLessonId, allLessons]);

  const handleSelectLesson = useCallback((lessonId) => {
    setActiveLessonId(lessonId);
    setSidebarOpen(false);
    const main = document.getElementById('lesson-scroll-area');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleToggleModule = useCallback((moduleId) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [courseRes, enrollRes, progressRes] = await Promise.all([
        fetch(`${API_BASE}/api/courses/${id}`),
        user ? fetch(`${API_BASE}/api/enrollments/my-progress`, { headers: { Authorization: `Bearer ${token()}` } }) : Promise.resolve({ ok: false }),
        user ? fetch(`${API_BASE}/api/enrollments/${id}/progress`, { headers: { Authorization: `Bearer ${token()}` } }) : Promise.resolve({ ok: false }),
      ]);

      const courseData = await courseRes.json();
      if (!courseRes.ok) { showToast('Course not found.', 'error'); navigate('/courses'); return; }
      setCourse(courseData);

      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        const enroll = enrollData.find(e => {
          const cid = e.courseId?._id || e.courseId;
          return cid === id;
        });
        if (enroll) setEnrolled(true);
        else { navigate('/courses'); showToast('Enroll first to access this course.', 'error'); return; }
      } else if (user) {
        navigate('/courses');
        showToast('Enroll first to access this course.', 'error');
        return;
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData);
      }
    } catch { showToast('Failed to load course.', 'error'); navigate('/courses'); }
    setLoading(false);
  }, [id, user, navigate, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markSection = useCallback(async (section, resourceId) => {
    if (!user) return showToast('Sign in required.', 'error');
    setMarking(section + (resourceId || ''));
    try {
      const res = await fetch(`${API_BASE}/api/enrollments/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ section, resourceId }),
      });
      const data = await res.json();
      if (res.ok) {
        setProgress(prev => ({ ...prev, ...data }));
        if (data.completed) showToast('Congratulations! Course completed!', 'success');
        else showToast('Section marked as complete!');
      } else {
        showToast(data.error || 'Failed to update progress.', 'error');
      }
    } catch { showToast('Network error.', 'error'); }
    setMarking(null);
  }, [id, user, showToast]);

  useAutoComplete({ lesson: activeLesson, isComplete: activeLesson?.completed, onMark: markSection });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="h-7 w-7 animate-spin text-slate-300" />
          <span className="text-xs text-slate-400 font-medium">Loading course...</span>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const courseProgress = curriculum.totalLessons > 0
    ? Math.round((curriculum.completedLessons / curriculum.totalLessons) * 100)
    : 0;
  const allLessonsDone = curriculum.totalLessons > 0 && curriculum.completedLessons >= curriculum.totalLessons;
  const activeModule = curriculum.modules.find(m => m.lessons.some(l => l.id === activeLesson?.id));

  return (
    <div className="min-h-screen bg-slate-50">
      {showAssessment && (
        <Assessment
          course={course}
          userName={user?.name}
          onComplete={() => setShowAssessment(false)}
          onClose={() => setShowAssessment(false)}
          onPass={markAssessmentPassed}
          onFinalize={markAssessmentFinalized}
          assessmentPassed={assessmentPassed}
          assessmentFinalized={assessmentFinalized}
        />
      )}

      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 shrink-0 border-r border-slate-200 bg-white">
          <CourseSidebar
            course={course}
            curriculum={curriculum}
            progress={progress}
            activeLessonId={activeLesson?.id}
            expandedModules={expandedModules}
            onToggleModule={handleToggleModule}
            onSelectLesson={handleSelectLesson}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <CourseSidebar
            course={course}
            curriculum={curriculum}
            progress={progress}
            activeLessonId={activeLesson?.id}
            expandedModules={expandedModules}
            onToggleModule={handleToggleModule}
            onSelectLesson={handleSelectLesson}
          />
        </MobileSidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-screen">
          <CourseHeader
            course={course}
            activeLesson={activeLesson}
            courseProgress={courseProgress}
            isCompleted={allLessonsDone}
            onBack={() => navigate('/courses')}
            onToggleSidebar={() => setSidebarOpen(true)}
          />

          {/* Scrollable lesson content */}
          <div id="lesson-scroll-area" className="flex-1 overflow-y-auto overscroll-contain">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              {allLessonsDone && activeLessonIndex <= 0 && (
                <CompletionBanner onShowAssessment={() => setShowAssessment(true)} />
              )}

              <LessonContent
                lesson={activeLesson}
                course={course}
                progress={progress}
                marking={marking}
                onMark={markSection}
                onShowAssessment={() => setShowAssessment(true)}
                markLessonLocal={markLessonLocal}
                moduleName={activeModule?.title}
                onAutoNext={nextLesson ? () => handleSelectLesson(nextLesson.id) : null}
                userName={user?.name}
                curriculum={curriculum}
                userId={user?.id}
                assessmentPassed={assessmentPassed}
                assessmentScore={assessmentScore}
              />
            </div>
          </div>

          {/* Pinned bottom: navigation + course info */}
          <div className="shrink-0 border-t border-slate-200 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
              <LessonNavigation
                prevLesson={prevLesson}
                nextLesson={nextLesson}
                onSelectLesson={handleSelectLesson}
              />
              <CourseInfoPanel course={course} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
