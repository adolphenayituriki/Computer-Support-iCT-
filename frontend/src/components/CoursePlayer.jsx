import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaCircle, FaClock, FaVideo, FaBookOpen, FaLink, FaSpinner, FaPlay, FaFileAlt, FaExternalLinkAlt, FaHighlighter, FaPrint, FaMinus, FaPlus, FaTimes, FaClipboardCheck } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import API_BASE from '../api';
import Assessment from './Assessment';

function token() { return localStorage.getItem('cshub_token'); }

const CATEGORY_COLORS = {
  hardware: 'bg-blue-100 text-blue-700', software: 'bg-purple-100 text-purple-700', network: 'bg-cyan-100 text-cyan-700',
  virus: 'bg-red-100 text-red-700', training: 'bg-amber-100 text-amber-700', general: 'bg-slate-100 text-slate-700',
};

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-100 text-emerald-700', intermediate: 'bg-orange-100 text-orange-700', advanced: 'bg-red-100 text-red-700',
};

function ProgressBar({ progress }) {
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500 ease-out" style={{
        width: `${progress}%`,
        background: progress >= 100 ? '#10b981' : 'linear-gradient(90deg, #FFCE08, #f59e0b)',
      }} />
    </div>
  );
}

function SectionCheck({ checked, onChange, label, sublabel, icon: Icon }) {
  return (
    <button onClick={onChange}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${checked ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
      <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
        {checked ? <FaCheckCircle size={14} /> : <FaCircle size={10} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-slate-800">{label}</div>
        {sublabel && <div className="text-[10px] text-slate-400 mt-0.5">{sublabel}</div>}
      </div>
      {Icon && <Icon size={12} className="text-slate-400 shrink-0" />}
    </button>
  );
}

export default function CoursePlayer() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [highlightMode, setHighlightMode] = useState(false);
  const [textSize, setTextSize] = useState(14);
  const [highlights, setHighlights] = useState([]);
  const highlightKey = `course-highlights-${id || 'unknown'}`;
  const [showAssessment, setShowAssessment] = useState(false);

  useEffect(() => {
    const style = document.getElementById('highlight-style') || document.createElement('style');
    style.id = 'highlight-style';
    if (highlightMode) {
      style.textContent = '.prose ::selection { background: #fef08a; } .prose mark[data-highlight] { background: #fef08a; cursor: pointer; padding: 1px 0; border-radius: 2px; }';
    } else {
      style.textContent = '.prose mark[data-highlight] { background: #fef08a; cursor: pointer; padding: 1px 0; border-radius: 2px; }';
    }
    if (!document.getElementById('highlight-style')) document.head.appendChild(style);
    return () => { if (style.parentNode) style.remove(); };
  }, [highlightMode]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(highlightKey);
      if (saved) setHighlights(JSON.parse(saved));
    } catch {}
  }, [highlightKey]);

  useEffect(() => {
    localStorage.setItem(highlightKey, JSON.stringify(highlights));
  }, [highlights, highlightKey]);

  useEffect(() => {
    const prose = document.querySelector('.prose');
    if (!prose) return;
    prose.querySelectorAll('mark[data-highlight]').forEach((el) => el.replaceWith(document.createTextNode(el.textContent)));

    highlights.forEach((h) => {
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
          mark.addEventListener('click', () => setHighlights((prev) => prev.filter((x) => x.id !== h.id)));
          range.surroundContents(mark);
          break;
        }
      }
    });
  }, [highlights]);

  useEffect(() => {
    if (!highlightMode) return;
    const handleMouseUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
      const prose = document.querySelector('.prose');
      if (!prose || !prose.contains(sel.anchorNode)) return;
      const text = sel.toString().trim();
      if (!text) return;
      const exists = highlights.some((h) => h.text === text);
      if (!exists) {
        setHighlights((prev) => [...prev, { id: Date.now().toString(), text }]);
      }
      sel.removeAllRanges();
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [highlightMode, highlights]);

  const clearAllHighlights = () => {
    setHighlights([]);
    showToast('All highlights removed.');
  };

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
        const enroll = enrollData.find((e) => {
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

  const markSection = async (section, resourceId) => {
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
        setProgress((prev) => ({ ...prev, ...data }));
        if (data.completed) showToast('Congratulations! Course completed!', 'success');
        else showToast('Section marked as complete!');
      } else {
        showToast(data.error || 'Failed to update progress.', 'error');
      }
    } catch { showToast('Network error.', 'error'); }
    setMarking(null);
  };

  const handlePrint = () => {
    const content = document.querySelector('.prose');
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>${course.title} - Course Content</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.7;color:#1e293b;}h1{font-size:1.5rem;margin-bottom:0.5rem;}h2{font-size:1.25rem;margin-top:1.5rem;border-bottom:1px solid #e2e8f0;padding-bottom:0.3rem;}h3{font-size:1.1rem;margin-top:1.2rem;}ul,ol{padding-left:1.5rem;}li{margin:0.25rem 0;}strong{color:#0f172a;}</style></head><body>`);
    win.document.write(`<h1>${course.title}</h1><p style="color:#64748b;font-size:0.85rem;margin-bottom:1.5rem;">${course.description}</p><hr style="margin:1rem 0;border:none;border-top:1px solid #e2e8f0;">`);
    win.document.write(content.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <FaSpinner className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (!course) return null;

  const sections = progress?.sections || {};
  const courseProgress = progress?.progress || 0;
  const isCompleted = progress?.completed;

  const hasContent = !!course.content;
  const hasVideo = !!course.videoUrl;
  const hasIntroVideo = !!course.introVideo;
  const hasResources = course.resources && course.resources.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 pt-[80px]">
      {showAssessment && (
        <Assessment
          course={course}
          userName={user && user.name}
          onComplete={() => setShowAssessment(false)}
        />
      )}
      <div className="sticky top-[80px] z-30 flex h-12 items-center gap-3 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-6xl px-4 flex items-center gap-4 w-full">
          <button onClick={() => navigate('/courses')} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors shrink-0">
            <FaArrowLeft /> <span className="hidden sm:inline">Back</span>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-slate-900 truncate">{course.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-semibold ${DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.beginner}`}>{course.difficulty}</span>
              {course.estimatedTime && <span className="text-[10px] text-slate-400 flex items-center gap-1"><FaClock size={8} /> {course.estimatedTime}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block text-right">
              <div className="text-[10px] font-bold" style={{ color: courseProgress >= 100 ? '#10b981' : '#FFCE08' }}>{courseProgress}% Complete</div>
            </div>
            <div className="w-24 hidden sm:block"><ProgressBar progress={courseProgress} /></div>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                <FaCheckCircle size={10} /> Done
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:hidden py-2">
        <div className="flex items-center gap-2">
          <div className="flex-1"><ProgressBar progress={courseProgress} /></div>
          <span className="text-[10px] font-bold shrink-0" style={{ color: courseProgress >= 100 ? '#10b981' : '#FFCE08' }}>{courseProgress}%</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {hasVideo && (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <FaVideo className="text-red-500" /> Course Video
                  </div>
                </div>
                <div className="aspect-video bg-slate-900">
                  <iframe src={course.videoUrl.includes('embed') ? course.videoUrl : course.videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title="Course Video" />
                </div>
              </div>
            )}

            {hasIntroVideo && !hasVideo && (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <FaPlay className="text-[#FFCE08]" /> Introduction Video
                  </div>
                </div>
                <div className="aspect-video bg-slate-900">
                  <iframe src={course.introVideo.includes('embed') ? course.introVideo : course.introVideo.replace('watch?v=', 'embed/')}
                    className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title="Introduction Video" />
                </div>
              </div>
            )}

            {hasContent && (
              <div className="rounded-2xl border-2 border-[#FFCE08]/30 bg-gradient-to-br from-white to-yellow-50/50 overflow-hidden shadow-lg shadow-amber-100/50">
                <div className="p-4 border-b border-slate-600 flex items-center justify-between" style={{ background: '#6B7280' }}>
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <FaBookOpen className="text-white text-xs" />
                    </div>
                    Course Content
                  </div>
                  <span className="text-[10px] text-white/80 font-medium bg-white/15 px-2 py-0.5 rounded-full">Scroll to read</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-6 scroll-smooth">
                  <div className="prose prose-sm prose-slate max-w-none" style={{ fontSize: `${textSize}px` }}>
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{course.content}</ReactMarkdown>
                  </div>
                </div>
                <div className="border-t border-amber-100 bg-gradient-to-r from-amber-50/80 to-white px-4 py-2.5">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] font-semibold text-amber-700 mr-1">Tools:</span>
                    <button onClick={() => setHighlightMode(!highlightMode)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-colors cursor-pointer ${highlightMode ? 'bg-amber-400 border-amber-500 text-white' : 'bg-white border-amber-200 text-slate-600 hover:bg-amber-100 hover:border-amber-300'}`}>
                      <FaHighlighter size={9} className={highlightMode ? 'text-white' : 'text-amber-500'} /> Highlight {highlightMode ? 'ON' : 'OFF'}
                    </button>
                    <div className="inline-flex items-center rounded-lg border border-amber-200 bg-white overflow-hidden">
                      <button onClick={() => setTextSize((s) => Math.max(10, s - 2))}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-amber-100 transition-colors cursor-pointer border-r border-amber-200">
                        <FaMinus size={8} />
                      </button>
                      <span className="px-2 py-1 text-[10px] font-semibold text-slate-500 min-w-[2rem] text-center">{textSize}px</span>
                      <button onClick={() => setTextSize((s) => Math.min(24, s + 2))}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-amber-100 transition-colors cursor-pointer border-l border-amber-200">
                        <FaPlus size={8} />
                      </button>
                    </div>
                    <button onClick={handlePrint}
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-200 px-2.5 py-1 text-[10px] font-medium text-slate-600 hover:bg-amber-100 hover:border-amber-300 transition-colors cursor-pointer">
                      <FaPrint size={9} className="text-amber-500" /> Print
                    </button>
                    {highlights.length > 0 && (
                      <button onClick={clearAllHighlights}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1 text-[10px] font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors cursor-pointer">
                        <FaTimes size={8} /> Clear ({highlights.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {hasResources && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
                  <FaLink className="text-[#FFCE08]" /> Resources ({course.resources.length})
                </div>
                <div className="space-y-2">
                  {course.resources.map((res) => (
                    <a key={res._id} href={res.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                        {res.type === 'video' ? <FaVideo size={12} className="text-red-500" /> :
                         res.type === 'file' ? <FaFileAlt size={12} className="text-blue-500" /> :
                         <FaLink size={12} className="text-slate-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-800 truncate">{res.title}</div>
                        {res.description && <div className="text-[10px] text-slate-400 truncate">{res.description}</div>}
                      </div>
                      <FaExternalLinkAlt size={10} className="text-slate-300 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-[150px] space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Track Progress</h3>
                <div className="space-y-2">
                  {hasContent && (
                    <SectionCheck checked={sections.contentRead} label="Read Course Content"
                      sublabel="Read through the full course material"
                      onChange={() => !sections.contentRead && markSection('content')}
                      icon={FaBookOpen} />
                  )}
                  {hasIntroVideo && (
                    <SectionCheck checked={sections.introVideoWatched} label="Watch Introduction"
                      sublabel="Watch the intro video"
                      onChange={() => !sections.introVideoWatched && markSection('introVideo')}
                      icon={FaPlay} />
                  )}
                  {hasVideo && (
                    <SectionCheck checked={sections.videoWatched} label="Watch Course Video"
                      sublabel="Watch the main course video"
                      onChange={() => !sections.videoWatched && markSection('video')}
                      icon={FaVideo} />
                  )}
                  {hasResources && course.resources.map((res) => (
                    <SectionCheck key={res._id}
                      checked={sections.resourcesChecked?.includes(res._id)}
                      label={`Check: ${res.title}`}
                      sublabel={res.description || res.type}
                      onChange={() => !sections.resourcesChecked?.includes(res._id) && markSection('resource', res._id)}
                      icon={FaLink} />
                  ))}
                </div>
                {!hasContent && !hasVideo && !hasIntroVideo && !hasResources && (
                  <p className="text-xs text-slate-400 text-center py-4">No trackable sections available.</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Course Info</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between"><span className="text-slate-400">Author</span><span className="font-medium">{course.author}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Category</span><span className="font-medium capitalize">{course.category}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Difficulty</span><span className="font-medium capitalize">{course.difficulty}</span></div>
                  {course.estimatedTime && <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="font-medium">{course.estimatedTime}</span></div>}
                  <div className="flex justify-between"><span className="text-slate-400">Published</span><span className="font-medium">{new Date(course.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>

              {isCompleted && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center">
                  <FaCheckCircle className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
                  <h3 className="text-sm font-bold text-emerald-900 mb-1">Course Completed!</h3>
                  <p className="text-xs text-emerald-600 mb-3">Great job finishing this course.</p>
                  <button onClick={() => setShowAssessment(true)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 rounded-xl text-xs font-bold hover:from-amber-500 hover:to-yellow-500 transition-all flex items-center justify-center gap-2">
                    <FaClipboardCheck /> Take Assessment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
