import { useState, useEffect } from 'react';
import { FaBookOpen, FaClock, FaSignal, FaArrowLeft, FaTag, FaUser, FaHeart, FaRegHeart, FaComment, FaShare, FaPaperPlane } from 'react-icons/fa';
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

function DifficultyBadge({ level }) {
  return (
    <span className={`badge badge-difficulty badge-difficulty-${level || 'beginner'}`}>
      <FaSignal size={10} /> {level}
    </span>
  );
}

function CategoryBadge({ category }) {
  const cat = category || 'general';
  return (
    <span className={`badge badge-cat-${cat}`}>
      {CATEGORY_ICONS[cat] || '\u{1F4D6}'} {cat}
    </span>
  );
}

export default function Courses() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [localLikes, setLocalLikes] = useState({});
  const [localComments, setLocalComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || c.category === filterCat;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(courses.map((c) => c.category))];

  const handleLike = async (id) => {
    if (!user) return showToast('Sign in to like courses.', 'error');
    const res = await fetch(`${API_BASE}/api/courses/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    });
    const data = await res.json();
    if (res.ok) {
      setLocalLikes((prev) => ({
        ...prev,
        [id]: { count: data.likesCount, liked: data.liked },
      }));
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
    if (res.ok) {
      setLocalComments((prev) => ({ ...prev, [id]: data.comments }));
      setCommentText('');
    } else {
      showToast(data.error || 'Failed to post comment.', 'error');
    }
  };

  const handleShare = (item) => {
    const url = `${window.location.origin}/courses#${item._id}`;
    if (navigator.share) {
      navigator.share({ title: item.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => showToast('Link copied!')).catch(() => showToast('Failed to copy link.', 'error'));
    }
  };

  if (selected) {
    const likes = localLikes[selected._id] || { count: 0, liked: false };
    const comments = localComments[selected._id] || [];

    return (
      <div className="page-shell">
        <div className="page-shell-narrow">
          <button type="button" onClick={() => setSelected(null)} className="back-btn">
            <FaArrowLeft /> Back to Courses
          </button>
          <article className="course-detail">
            <div className="course-detail-header">
              <CategoryBadge category={selected.category} />
              <DifficultyBadge level={selected.difficulty} />
              {selected.estimatedTime && (
                <span className="course-card-meta">
                  <FaClock size={12} /> {selected.estimatedTime}
                </span>
              )}
            </div>
            <h1>{selected.title}</h1>
            <p className="course-detail-lead">{selected.description}</p>
            {selected.tags?.length > 0 && (
              <div className="course-detail-tags">
                {selected.tags.map((tag, i) => (
                  <span key={i} className="tag-pill">
                    <FaTag size={10} /> {tag}
                  </span>
                ))}
              </div>
            )}
            {selected.content ? (
              <div className="course-detail-body course-content">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{selected.content.replace(/For the testimonials[\s\S]*$/i, '')}</ReactMarkdown>
              </div>
            ) : (
              <p className="course-detail-lead" style={{ fontStyle: 'italic', color: '#9ca3af' }}>Full content coming soon.</p>
            )}
            <div className="course-detail-footer">
              <FaUser size={12} /> {selected.author} &middot; {new Date(selected.createdAt).toLocaleDateString()}
            </div>
            <div className="news-card-actions" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
              <button type="button" className={`news-action-btn${likes.liked ? ' liked' : ''}`} onClick={() => handleLike(selected._id)}>
                {likes.liked ? <FaHeart /> : <FaRegHeart />} {likes.count}
              </button>
              <button type="button" className="news-action-btn" onClick={() => document.getElementById('course-comment-input')?.focus()}>
                <FaComment /> {comments.length}
              </button>
              <button type="button" className="news-action-btn" onClick={() => handleShare(selected)}>
                <FaShare /> Share
              </button>
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaComment style={{ color: '#FFCE08' }} /> Comments ({comments.length})
              </h4>
              {comments.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.75rem' }}>No comments yet. Start the conversation!</p>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '0.75rem' }}>
                  {comments.map((c, i) => (
                    <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                        <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#a16207' }}>
                          {c.userName?.charAt(0).toUpperCase() || <FaUser size={9} />}
                        </span>
                        <strong style={{ fontSize: '0.8rem' }}>{c.userName}</strong>
                        <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#334155', marginLeft: '2rem' }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
              {user ? (
                <div className="msg-reply-form">
                  <input
                    id="course-comment-input"
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(selected._id); } }}
                  />
                  <button type="button" className="btn btn-sm" disabled={submitting || !commentText.trim()} onClick={() => handleComment(selected._id)}>
                    {submitting ? <span className="btn-spinner"></span> : <FaPaperPlane />}
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', padding: '0.5rem 0' }}>
                  <button type="button" className="btn-link" onClick={() => navigate('/')}>Sign in</button> to leave a comment.
                </p>
              )}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-shell-inner">
        <div className="page-hero section-reveal revealed">
          <h1 className="section-title">
            <FaBookOpen className="page-hero-icon" />
            Knowledge Base
          </h1>
          <p className="section-sub">
            Short guides and tutorials covering the most common questions and issues.
          </p>
        </div>

        <div className="page-filters section-reveal revealed">
          <input
            type="text"
            className="page-search"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="page-select"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state section-reveal revealed">
            <FaBookOpen size={48} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
            <p>No courses found. Check back later for new guides.</p>
          </div>
        ) : (
          <div className="course-grid section-reveal revealed">
            {filtered.map((course) => (
              <article
                key={course._id}
                className="course-card"
                onClick={() => setSelected(course)}
                onKeyDown={(e) => e.key === 'Enter' && setSelected(course)}
                role="button"
                tabIndex={0}
              >
                <div className="course-card-badges">
                  <CategoryBadge category={course.category} />
                  <DifficultyBadge level={course.difficulty} />
                </div>
                <h3>{course.title}</h3>
                <p className="course-card-desc">{course.description}</p>
                <div className="course-card-meta">
                  {course.estimatedTime ? (
                    <span><FaClock size={11} /> {course.estimatedTime}</span>
                  ) : <span />}
                  <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
