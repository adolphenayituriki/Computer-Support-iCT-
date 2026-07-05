import { useState, useEffect, useRef } from 'react';
import { FaNewspaper, FaYoutube, FaImage, FaCalendarAlt, FaHeart, FaRegHeart, FaComment, FaShare, FaTimes, FaPaperPlane, FaUser, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';

function token() { return localStorage.getItem('cshub_token'); }

export default function News() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localLikes, setLocalLikes] = useState({});
  const [localComments, setLocalComments] = useState({});
  const msgEndRef = useRef(null);

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => {
        setNews(data);
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

  useEffect(() => {
    if (selected && msgEndRef.current) {
      msgEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selected, localComments]);

  const getYouTubeEmbed = (url) => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  };

  const openModal = (item) => {
    setSelected(item);
    setCommentText('');
  };

  const closeModal = () => setSelected(null);

  const handleLike = async (id) => {
    if (!user) return showToast('Sign in to like posts.', 'error');
    const res = await fetch(`/api/news/${id}/like`, {
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
    const res = await fetch(`/api/news/${id}/comment`, {
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
    const url = `${window.location.origin}/news#${item._id}`;
    if (navigator.share) {
      navigator.share({ title: item.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => showToast('Link copied!')).catch(() => showToast('Failed to copy link.', 'error'));
    }
  };

  const selectedLikes = selected ? localLikes[selected._id] : null;
  const selectedComments = selected ? localComments[selected._id] || [] : [];

  return (
    <div className="page-shell">
      <div className="page-shell-inner">
        <button type="button" onClick={() => navigate('/')} className="back-btn">
          <FaArrowLeft /> Back to Home
        </button>

        <div className="page-hero">
          <h2 className="section-title">
            <FaNewspaper className="page-hero-icon" />
            Latest News
          </h2>
          <p className="section-sub">Stay updated with the latest from CS hub (iCT)</p>
        </div>

        {news.length === 0 ? (
          <div className="empty-state">
            <FaNewspaper size={48} style={{ marginBottom: '1rem', opacity: 0.4, color: '#9ca3af' }} />
            <p>No news posted yet. Check back later!</p>
          </div>
        ) : (
          <div className="news-feed">
            {news.map((item) => {
              const embedUrl = item.mediaType === 'video' ? getYouTubeEmbed(item.mediaUrl) : '';
              const likes = localLikes[item._id] || { count: 0, liked: false };
              return (
                <article key={item._id} className="news-card">
                  {item.mediaType === 'image' && item.mediaUrl && (
                    <div className="news-card-media">
                      <img src={item.mediaUrl} alt={item.title} />
                    </div>
                  )}
                  {item.mediaType === 'video' && embedUrl && (
                    <div className="news-card-video">
                      <iframe src={embedUrl} title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  )}
                  <div className="news-card-body">
                    <div className="news-card-meta">
                      <span>
                        <FaCalendarAlt /> {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      {item.mediaType === 'image' && <span className="badge badge-media-photo"><FaImage /> Photo</span>}
                      {item.mediaType === 'video' && <span className="badge badge-media-video"><FaYoutube /> Video</span>}
                      {item.mediaType === 'text' && <span className="badge badge-media-article">Article</span>}
                      <span style={{ color: '#9ca3af' }}>By {item.author}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <div className="news-card-actions">
                      <button type="button" className={`news-action-btn${likes.liked ? ' liked' : ''}`} onClick={() => handleLike(item._id)}>
                        {likes.liked ? <FaHeart /> : <FaRegHeart />} {likes.count}
                      </button>
                      <button type="button" className="news-action-btn" onClick={() => openModal(item)}>
                        <FaComment /> {item.comments?.length || 0}
                      </button>
                      <button type="button" className="news-action-btn" onClick={() => handleShare(item)}>
                        <FaShare /> Share
                      </button>
                      {item.content && (
                        <button type="button" className="news-read-more" onClick={() => openModal(item)}>
                          Read More
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

      {selected && (
        <div className="modal-overlay" onClick={closeModal} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e1b4b' }}>{selected.title}</h3>
              <button type="button" className="ticket-action-btn" onClick={closeModal} aria-label="Close"><FaTimes /></button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>
              <div className="news-card-meta" style={{ marginBottom: '1rem' }}>
                <span>
                  <FaCalendarAlt /> {new Date(selected.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                {selected.mediaType === 'image' && <span className="badge badge-media-photo"><FaImage /> Photo</span>}
                {selected.mediaType === 'video' && <span className="badge badge-media-video"><FaYoutube /> Video</span>}
                <span style={{ color: '#9ca3af' }}>By {selected.author}</span>
              </div>

              {selected.mediaType === 'image' && selected.mediaUrl && (
                <div className="news-card-media" style={{ borderRadius: '10px', marginBottom: '1rem', overflow: 'hidden' }}>
                  <img src={selected.mediaUrl} alt={selected.title} />
                </div>
              )}
              {selected.mediaType === 'video' && getYouTubeEmbed(selected.mediaUrl) && (
                <div className="news-card-video" style={{ borderRadius: '10px', marginBottom: '1rem' }}>
                  <iframe src={getYouTubeEmbed(selected.mediaUrl)} title={selected.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              )}

              {selected.content && (
                <p style={{ fontSize: '0.92rem', lineHeight: '1.8', color: '#334155', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>{selected.content}</p>
              )}

              <div className="news-card-actions" style={{ marginBottom: '1.5rem', padding: '0.75rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <button type="button" className={`news-action-btn${selectedLikes?.liked ? ' liked' : ''}`} onClick={() => { closeModal(); handleLike(selected._id); }}>
                  {selectedLikes?.liked ? <FaHeart /> : <FaRegHeart />} {selectedLikes?.count || 0} Likes
                </button>
                <button type="button" className="news-action-btn" onClick={() => handleShare(selected)}>
                  <FaShare /> Share
                </button>
              </div>

              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#1e1b4b' }}>
                <FaComment style={{ color: '#FFCE08' }} /> Comments ({selectedComments.length})
              </h4>

              <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem' }}>
                {selectedComments.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>No comments yet. Start the conversation!</p>
                ) : (
                  selectedComments.map((c, i) => (
                    <div key={i} style={{ padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#a16207' }}>
                          {c.userName?.charAt(0).toUpperCase() || <FaUser size={10} />}
                        </span>
                        <strong style={{ fontSize: '0.82rem' }}>{c.userName}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#334155', marginLeft: '2.2rem' }}>{c.text}</p>
                    </div>
                  ))
                )}
                <div ref={msgEndRef} />
              </div>

              {user ? (
                <div className="msg-reply-form">
                  <input
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
                <p style={{ fontSize: '0.82rem', color: '#9ca3af', textAlign: 'center', padding: '0.5rem 0' }}>
                  <button type="button" className="btn-link" onClick={closeModal}>Sign in</button> to leave a comment.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
