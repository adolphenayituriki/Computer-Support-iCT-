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
      showToast('Failed to post comment.', 'error');
    }
  };

  const handleShare = (item) => {
    const url = `${window.location.origin}/news?post=${item._id}`;
    if (navigator.share) {
      navigator.share({ title: item.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => showToast('Link copied!')).catch(() => showToast('Failed to copy link.', 'error'));
    }
  };

  const selectedLikes = selected ? localLikes[selected._id] : null;
  const selectedComments = selected ? localComments[selected._id] || [] : [];

  return (
    <div className="news-page" style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px' }}>
      <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>
          <FaArrowLeft /> Back to Home
        </button>

        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <FaNewspaper style={{ color: '#FFCE08', marginRight: '0.5rem' }} />
          Latest News
        </h2>
        <p className="section-sub" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>Stay updated with the latest from CS hub (iCT)</p>

        {news.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#9ca3af' }}>
            <FaNewspaper size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p>No news posted yet. Check back later!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            {news.map((item) => {
              const embedUrl = item.mediaType === 'video' ? getYouTubeEmbed(item.mediaUrl) : '';
              const likes = localLikes[item._id] || { count: 0, liked: false };
              return (
                <article
                  key={item._id}
                  style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}
                >
                  {item.mediaType === 'image' && item.mediaUrl && (
                    <div style={{ width: '100%', maxHeight: '400px', overflow: 'hidden' }}>
                      <img src={item.mediaUrl} alt={item.title} style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }} />
                    </div>
                  )}
                  {item.mediaType === 'video' && embedUrl && (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', background: '#000' }}>
                      <iframe src={embedUrl} title={item.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
                    </div>
                  )}
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FaCalendarAlt /> {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      {item.mediaType === 'image' && <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1d4ed8', padding: '0.1rem 0.4rem', borderRadius: '999px' }}><FaImage /> Photo</span>}
                      {item.mediaType === 'video' && <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#dc2626', padding: '0.1rem 0.4rem', borderRadius: '999px' }}><FaYoutube /> Video</span>}
                      {item.mediaType === 'text' && <span style={{ fontSize: '0.7rem', background: '#f3e8ff', color: '#7c3aed', padding: '0.1rem 0.4rem', borderRadius: '999px' }}>Article</span>}
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>By {item.author}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e1b4b' }}>{item.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                      <button onClick={() => handleLike(item._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: likes.liked ? '#ef4444' : '#6b7280' }}>
                        {likes.liked ? <FaHeart /> : <FaRegHeart />} {likes.count}
                      </button>
                      <button onClick={() => openModal(item)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#6b7280' }}>
                        <FaComment /> {item.comments?.length || 0}
                      </button>
                      <button onClick={() => handleShare(item)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#6b7280' }}>
                        <FaShare /> Share
                      </button>
                      {item.content && (
                        <button onClick={() => openModal(item)} style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
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
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selected.title}</h3>
              <button className="ticket-action-btn" onClick={closeModal}><FaTimes /></button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaCalendarAlt /> {new Date(selected.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                {selected.mediaType === 'image' && <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1d4ed8', padding: '0.1rem 0.4rem', borderRadius: '999px' }}><FaImage /> Photo</span>}
                {selected.mediaType === 'video' && <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#dc2626', padding: '0.1rem 0.4rem', borderRadius: '999px' }}><FaYoutube /> Video</span>}
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>By {selected.author}</span>
              </div>

              {selected.mediaType === 'image' && selected.mediaUrl && (
                <div style={{ width: '100%', maxHeight: '400px', overflow: 'hidden', borderRadius: '8px', marginBottom: '1rem' }}>
                  <img src={selected.mediaUrl} alt={selected.title} style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
              {selected.mediaType === 'video' && getYouTubeEmbed(selected.mediaUrl) && (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', background: '#000', borderRadius: '8px', marginBottom: '1rem' }}>
                  <iframe src={getYouTubeEmbed(selected.mediaUrl)} title={selected.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
                </div>
              )}

              {selected.content && (
                <p style={{ fontSize: '0.92rem', lineHeight: '1.8', color: '#334155', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>{selected.content}</p>
              )}

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', padding: '0.75rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <button onClick={() => { closeModal(); handleLike(selected._id); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: selectedLikes?.liked ? '#ef4444' : '#6b7280' }}>
                  {selectedLikes?.liked ? <FaHeart /> : <FaRegHeart />} {selectedLikes?.count || 0} Likes
                </button>
                <button onClick={() => handleShare(selected)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#6b7280' }}>
                  <FaShare /> Share
                </button>
              </div>

              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                <FaComment /> Comments ({selectedComments.length})
              </h4>

              <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem' }}>
                {selectedComments.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>No comments yet.</p>
                ) : (
                  selectedComments.map((c, i) => (
                    <div key={i} style={{ padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600, color: '#64748b' }}>
                          {c.userName?.charAt(0).toUpperCase() || <FaUser size={10} />}
                        </span>
                        <strong style={{ fontSize: '0.82rem' }}>{c.userName}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#334155', marginLeft: '2rem' }}>{c.text}</p>
                    </div>
                  ))
                )}
                <div ref={msgEndRef} />
              </div>

              {user ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(selected._id); } }}
                    style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                  />
                  <button className="btn btn-sm" disabled={submitting || !commentText.trim()} onClick={() => handleComment(selected._id)}>
                    {submitting ? <span className="btn-spinner"></span> : <FaPaperPlane />}
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: '#9ca3af', textAlign: 'center', padding: '0.5rem 0' }}>
                  <a href="#login" onClick={(e) => { e.preventDefault(); closeModal(); }} style={{ color: '#3b82f6' }}>Sign in</a> to leave a comment.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
