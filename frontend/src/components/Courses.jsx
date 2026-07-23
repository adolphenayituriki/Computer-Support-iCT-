import { useState, useEffect, useCallback } from 'react';
import { FaBookOpen, FaClock, FaSignal, FaArrowLeft, FaTag, FaUser, FaHeart, FaRegHeart, FaComment, FaShare, FaPaperPlane, FaPlay, FaCheckCircle, FaSpinner, FaGraduationCap, FaLock, FaTimes, FaClipboardCheck, FaCircle } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import API_BASE from '../api';

function token() { return localStorage.getItem('cshub_token'); }

const CATEGORY_ICONS = {
  hardware: '\u{1F4BB}', software: '\u{1F5A5}\u{FE0F}', network: '\u{1F310}', virus: '\u{1F6E1}\u{FE0F}', training: '\u{1F4DA}', general: '\u{1F4D6}',
};

const CATEGORY_COLORS = {
  hardware: 'bg-blue-100 text-blue-700', software: 'bg-purple-100 text-purple-700', network: 'bg-cyan-100 text-cyan-700',
  virus: 'bg-red-100 text-red-700', training: 'bg-amber-100 text-amber-700', general: 'bg-slate-100 text-slate-700',
};

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-100 text-emerald-700', intermediate: 'bg-orange-100 text-orange-700', advanced: 'bg-red-100 text-red-700',
};

function ProgressRing({ progress, size = 40, stroke = 3 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={progress >= 100 ? '#10b981' : '#FFCE08'} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size * 0.28} fontWeight="700" fill={progress >= 100 ? '#10b981' : '#1e293b'}>
        {progress}%
      </text>
    </svg>
  );
}

function ProgressBar({ progress }) {
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500 ease-out" style={{
        width: `${progress}%`,
        background: progress >= 100 ? '#10b981' : 'linear-gradient(90deg, #FFCE08, #f59e0b)',
      }} />
    </div>
  );
}

export default function Courses({ onLoginClick }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [localLikes, setLocalLikes] = useState({});
  const [localComments, setLocalComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/courses`)
      .then((r) => r.json())
      .then((data) => {
        setCourses(data);
        const likes = {};
        const comments = {};
        data.forEach((item) => {
          likes[item._id] = { count: item.likes?.length || 0, liked: user ? item.likes?.some((id) => id === user.id || id._id === user.id) : false };
          comments[item._id] = item.comments || [];
        });
        setLocalLikes(likes);
        setLocalComments(comments);
      })
      .catch(() => {});
  }, [user]);

  const fetchEnrollments = useCallback(() => {
    if (!user) return;
    fetch(`${API_BASE}/api/enrollments/my-progress`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const map = {};
          data.forEach((e) => { map[e.courseId] = e; });
          setEnrollments(map);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || c.category === filterCat;
    let matchStatus = true;
    if (filterStatus === 'enrolled') matchStatus = !!enrollments[c._id] && !enrollments[c._id]?.progress?.completed;
    else if (filterStatus === 'completed') matchStatus = !!enrollments[c._id]?.progress?.completed;
    else if (filterStatus === 'not-enrolled') matchStatus = !enrollments[c._id];
    return matchSearch && matchCat && matchStatus;
  });

  const categories = [...new Set(courses.map((c) => c.category))];

  const handleEnroll = async (courseId, e) => {
    e.stopPropagation();
    if (!user) {
      if (onLoginClick) return onLoginClick('Sign in to enroll in this course.');
      return showToast('Sign in to enroll in courses.', 'error');
    }
    setEnrolling(courseId);
    try {
      const res = await fetch(`${API_BASE}/api/enrollments/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Enrolled successfully!');
        fetchEnrollments();
      } else {
        showToast(data.error || 'Failed to enroll.', 'error');
      }
    } catch { showToast('Network error.', 'error'); }
    setEnrolling(null);
  };

  const handleLike = async (id) => {
    if (!user) return showToast('Sign in to like courses.', 'error');
    const res = await fetch(`${API_BASE}/api/courses/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    });
    const data = await res.json();
    if (res.ok) {
      setLocalLikes((prev) => ({ ...prev, [id]: { count: data.likesCount, liked: data.liked } }));
    }
  };

  const handleComment = async (id) => {
    if (!user) return showToast('Sign in to comment.', 'error');
    if (!commentText.trim()) return;
    setSubmitting(true);
    const res = await fetch(`${API_BASE}/api/courses/${id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ text: commentText.trim() }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) { setLocalComments((prev) => ({ ...prev, [id]: data.comments })); setCommentText(''); }
    else showToast(data.error || 'Failed to post comment.', 'error');
  };

  const handleShare = (item) => {
    const url = `${window.location.origin}/courses/${item._id}`;
    if (navigator.share) navigator.share({ title: item.title, url }).catch(() => {});
    else navigator.clipboard.writeText(url).then(() => showToast('Link copied!')).catch(() => showToast('Failed to copy link.', 'error'));
  };

  const handleStartCourse = (courseId, e) => {
    e.stopPropagation();
    navigate(`/courses/${courseId}`);
  };

  if (selected) {
    const enroll = enrollments[selected._id];
    const isEnrolled = !!enroll;
    const progress = enroll?.progress?.progress || 0;
    const isCompleted = enroll?.progress?.completed;
    const likes = localLikes[selected._id] || { count: 0, liked: false };
    const comments = localComments[selected._id] || [];

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 pt-32 pb-12">
          <div className="mb-8">
            <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-2">
              <FaBookOpen className="text-[#FFCE08]" /> Knowledge Base
            </h1>
            <p className="text-sm text-slate-500">Short guides and tutorials covering the most common questions and issues.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <div className="relative flex-1">
              <FaBookOpen className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
              <input type="text" placeholder="Search courses..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
            </div>
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900">
              <option value="">All Categories</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {user && (
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900">
                <option value="">All Status</option>
                <option value="enrolled">In Progress</option>
                <option value="completed">Completed</option>
                <option value="not-enrolled">Not Enrolled</option>
              </select>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <FaBookOpen size={40} className="text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">No courses found. Check back later for new guides.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((course) => {
                const enroll = enrollments[course._id];
                const isEnrolled = !!enroll;
                const progress = enroll?.progress?.progress || 0;
                const isCompleted = enroll?.progress?.completed;
                const visibleTags = (course.tags || []).slice(0, 3);
                const extraTags = (course.tags || []).length - 3;

                return (
                  <article key={course._id}
                    className="group rounded-xl border border-slate-200 bg-white overflow-hidden transition-all hover:shadow-md hover:border-slate-300 cursor-pointer flex flex-col"
                    onClick={() => setSelected(course)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelected(course)}
                    role="button" tabIndex={0}>
                    {course.thumbnail && (
                      <div className="aspect-video w-full overflow-hidden bg-slate-100">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[course.category] || CATEGORY_COLORS.general}`}>
                        {course.category}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.beginner}`}>
                        {course.difficulty}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <FaCheckCircle size={8} /> Done
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-slate-700">{course.title}</h3>
                    <p className="text-[11px] text-slate-500 mb-2 line-clamp-2 flex-1">{course.description}</p>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap mb-3">
                      {course.estimatedTime && (
                        <span className="flex items-center gap-1"><FaClock size={9} /> {course.estimatedTime}</span>
                      )}
                      {visibleTags.map((tag, i) => (
                        <span key={i} className="text-slate-400">{tag}</span>
                      ))}
                      {extraTags > 0 && (
                        <span className="text-slate-400 font-medium">+{extraTags}</span>
                      )}
                    </div>

                    {isEnrolled && !isCompleted && (
                      <div className="mb-3">
                        <ProgressBar progress={progress} />
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                      {!isEnrolled ? (
                        <button onClick={(e) => handleEnroll(course._id, e)} disabled={enrolling === course._id}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition-all disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #FFCE08, #f59e0b)' }}>
                          {enrolling === course._id ? <FaSpinner className="animate-spin" size={10} /> : <FaGraduationCap size={10} />}
                          Enroll
                        </button>
                      ) : (
                        <button onClick={(e) => handleStartCourse(course._id, e)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 transition-colors">
                          {isCompleted ? <><FaCheckCircle size={10} /> Review</> : progress > 0 ? <><FaPlay size={10} /> Continue</> : <><FaPlay size={10} /> Start</>}
                        </button>
                      )}
                    </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] max-h-[85vh] flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button onClick={() => setSelected(null)} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0">
                  <FaTimes size={14} />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-slate-900 truncate">{selected.title}</h2>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {selected.thumbnail && (
                <div className="w-full h-36 bg-slate-100 overflow-hidden">
                  <img src={selected.thumbnail} alt={selected.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[selected.category] || CATEGORY_COLORS.general}`}>
                    {selected.category}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${DIFFICULTY_COLORS[selected.difficulty] || DIFFICULTY_COLORS.beginner}`}>
                    {selected.difficulty}
                  </span>
                  {selected.estimatedTime && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400"><FaClock size={9} /> {selected.estimatedTime}</span>
                  )}
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-4">{selected.description}</p>

                {selected.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selected.tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        <FaTag size={8} /> {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-4">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Course Info</h4>
                  <div className="space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex justify-between"><span className="text-slate-400">Author</span><span className="font-medium">{selected.author}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="font-medium">{selected.estimatedTime || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Published</span><span className="font-medium">{new Date(selected.createdAt).toLocaleDateString()}</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={(e) => handleEnroll(selected._id, e)} disabled={enrolling === selected._id}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #FFCE08, #f59e0b)' }}>
                    {enrolling === selected._id ? <><FaSpinner className="animate-spin" /> Enrolling...</> : <><FaGraduationCap /> Enroll in Course</>}
                  </button>
                  <button type="button" onClick={() => handleLike(selected._id)}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${likes.liked ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {likes.liked ? <FaHeart /> : <FaRegHeart />} {likes.count}
                  </button>
                  <button type="button" onClick={() => handleShare(selected)}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-200 transition-colors">
                    <FaShare />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-12">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-2">
            <FaBookOpen className="text-[#FFCE08]" /> Knowledge Base
          </h1>
          <p className="text-sm text-slate-500">Short guides and tutorials covering the most common questions and issues.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <FaBookOpen className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
            <input type="text" placeholder="Search courses..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900">
            <option value="">All Categories</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          {user && (
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900">
              <option value="">All Status</option>
              <option value="enrolled">In Progress</option>
              <option value="completed">Completed</option>
              <option value="not-enrolled">Not Enrolled</option>
            </select>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <FaBookOpen size={40} className="text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">No courses found. Check back later for new guides.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((course) => {
              const enroll = enrollments[course._id];
              const isEnrolled = !!enroll;
              const progress = enroll?.progress?.progress || 0;
              const isCompleted = enroll?.progress?.completed;

              return (
                <article key={course._id}
                  className="group rounded-xl border border-slate-200 bg-white overflow-hidden transition-all hover:shadow-md hover:border-slate-300 cursor-pointer flex flex-col"
                  onClick={() => setSelected(course)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelected(course)}
                  role="button" tabIndex={0}>
                  {course.thumbnail && (
                    <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  )}
                  <div className="p-3 flex flex-col flex-1">
                    <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${CATEGORY_COLORS[course.category] || CATEGORY_COLORS.general}`}>
                        {course.category}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.beginner}`}>
                        {course.difficulty}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                          <FaCheckCircle size={7} /> Done
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-slate-700 leading-tight">{course.title}</h3>
                    <p className="text-[10px] text-slate-500 mb-2 line-clamp-2 flex-1 leading-relaxed">{course.description}</p>

                    {isEnrolled && !isCompleted && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-semibold text-slate-500">{progress}%</span>
                        </div>
                        <ProgressBar progress={progress} />
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                      {!isEnrolled ? (
                        <button onClick={(e) => handleEnroll(course._id, e)} disabled={enrolling === course._id}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-white transition-all disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #FFCE08, #f59e0b)' }}>
                          {enrolling === course._id ? <FaSpinner className="animate-spin" size={9} /> : <FaGraduationCap size={9} />}
                          Enroll
                        </button>
                      ) : (
                        <button onClick={(e) => handleStartCourse(course._id, e)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-slate-800 transition-colors">
                          {isCompleted ? <><FaCheckCircle size={9} /> Review</> : progress > 0 ? <><FaPlay size={9} /> Continue</> : <><FaPlay size={9} /> Start</>}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
