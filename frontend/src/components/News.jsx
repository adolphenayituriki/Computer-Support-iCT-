import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import API_BASE from '../api';
import {
  FaNewspaper, FaYoutube, FaImage, FaCalendarAlt, FaHeart, FaRegHeart,
  FaComment, FaShare, FaTimes, FaPaperPlane, FaUser, FaArrowLeft,
  FaSearch, FaFire, FaClock, FaAngleRight, FaEye, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

function token() { return localStorage.getItem('cshub_token'); }

function TimeAgo({ date }) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getYouTubeEmbed(url) {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

function getMediaIcon(type) {
  if (type === 'image') return <><FaImage /> Photo</>;
  if (type === 'video') return <><FaYoutube /> Video</>;
  return 'Article';
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

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
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const msgEndRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/news`)
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

  const { featured, rest } = useMemo(() => {
    const sorted = [...news].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { featured: sorted[0] || null, rest: sorted.slice(1) };
  }, [news]);

  const filtered = useMemo(() => {
    let items = rest;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.title.toLowerCase().includes(q) || (i.content && i.content.toLowerCase().includes(q)) || i.author.toLowerCase().includes(q));
    }
    if (filterType !== 'all') {
      items = items.filter((i) => i.mediaType === filterType);
    }
    return items;
  }, [rest, search, filterType]);

  const openModal = (item) => {
    setSelected(item);
    setCommentText('');
  };

  const closeModal = () => setSelected(null);

  const handleLike = async (id) => {
    if (!user) return showToast('Sign in to like posts.', 'error');
    const res = await fetch(`${API_BASE}/api/news/${id}/like`, {
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
    const res = await fetch(`${API_BASE}/api/news/${id}/comment`, {
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

  const topLiked = useMemo(() => {
    return [...news].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 3);
  }, [news]);

  const selectedLikes = selected ? localLikes[selected._id] : null;
  const selectedComments = selected ? localComments[selected._id] || [] : [];

  return (
    <div className="page-shell news-page">
      <div className="page-shell-inner">
        <div className="news-top-bar">
          <button type="button" onClick={() => navigate('/')} className="back-btn">
            <FaArrowLeft /> Home
          </button>
          <div className="news-search-wrap">
            <FaSearch className="news-search-icon" />
            <input
              type="text"
              className="news-search"
              placeholder="Search news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {featured && !search && filterType === 'all' && (
          <article className="news-featured" onClick={() => openModal(featured)}>
            <div className="news-featured-bg">
              {featured.mediaType === 'image' && featured.mediaUrl ? (
                <img src={featured.mediaUrl} alt={featured.title} />
              ) : featured.mediaType === 'video' && getYouTubeEmbed(featured.mediaUrl) ? (
                <img src={`https://img.youtube.com/vi/${getYouTubeEmbed(featured.mediaUrl).split('/').pop()}/maxresdefault.jpg`} alt={featured.title} onError={(e) => { e.target.style.display = 'none'; }} />
              ) : null}
            </div>
            <div className="news-featured-overlay" />
            <div className="news-featured-content">
              <div className="news-featured-badges">
                <span className="news-featured-badge news-featured-badge-hot"><FaFire /> Featured</span>
                <span className={`news-featured-badge news-featured-badge-${featured.mediaType}`}>{getMediaIcon(featured.mediaType)}</span>
              </div>
              <h2 className="news-featured-title">{featured.title}</h2>
              {featured.content && <p className="news-featured-desc">{featured.content.replace(/<[^>]*>/g, '').slice(0, 180)}...</p>}
              <div className="news-featured-meta">
                <span><FaUser /> {featured.author}</span>
                <span><FaCalendarAlt /> {formatDate(featured.createdAt)}</span>
                <span><FaHeart /> {featured.likes?.length || 0}</span>
                <span><FaComment /> {featured.comments?.length || 0}</span>
              </div>
            </div>
          </article>
        )}

        {topLiked.length > 0 && !search && filterType === 'all' && (
          <section className="news-trending">
            <div className="news-trending-header">
              <FaFire className="news-trending-icon" />
              <span>Trending</span>
            </div>
            <div className="news-trending-list">
              {topLiked.map((item, i) => (
                <button key={item._id} type="button" className="news-trending-item" onClick={() => openModal(item)}>
                  <span className="news-trending-num">{String(i + 1).padStart(2, '0')}</span>
                  <div className="news-trending-text">
                    <strong>{item.title}</strong>
                    <span><FaHeart /> {item.likes?.length || 0} likes</span>
                  </div>
                  <FaAngleRight className="news-trending-arrow" />
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="news-filters">
          <span className="news-filters-label">Filter:</span>
          {['all', 'text', 'image', 'video'].map((type) => (
            <button
              key={type}
              type="button"
              className={`news-filter-btn${filterType === type ? ' active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'All' : type === 'text' ? 'Articles' : type === 'image' ? 'Photos' : 'Videos'}
            </button>
          ))}
        </div>

        {!search && filterType === 'all' ? (
          <>
            {filtered.length > 0 && (
              <>
                <div className="news-section-header">
                  <FaNewspaper />
                  <span>Latest Articles</span>
                </div>
                <div className="news-grid">
                  {filtered.map((item) => {
                    const embedUrl = item.mediaType === 'video' ? getYouTubeEmbed(item.mediaUrl) : '';
                    const likes = localLikes[item._id] || { count: 0, liked: false };
                    return (
                      <article key={item._id} className={`news-grid-card news-grid-card-${item.mediaType}`}>
                        {item.mediaType === 'image' && item.mediaUrl && (
                          <div className="news-grid-card-media" onClick={() => openModal(item)}>
                            <img src={item.mediaUrl} alt={item.title} />
                            <span className="news-grid-card-media-badge"><FaImage /></span>
                          </div>
                        )}
                        {item.mediaType === 'video' && embedUrl && (
                          <div className="news-grid-card-media" onClick={() => openModal(item)}>
                            <iframe src={embedUrl} title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
                            <span className="news-grid-card-media-badge"><FaYoutube /></span>
                          </div>
                        )}
                        {item.mediaType === 'text' && (
                          <div className="news-grid-card-text-icon" onClick={() => openModal(item)}>
                            <FaNewspaper />
                          </div>
                        )}
                        <div className="news-grid-card-body">
                          <div className="news-grid-card-meta">
                            <span><FaCalendarAlt /> <TimeAgo date={item.createdAt} /></span>
                            <span><FaUser /> {item.author}</span>
                          </div>
                          <h3 onClick={() => openModal(item)}>{item.title}</h3>
                          <div className="news-grid-card-actions">
                            <button type="button" className={`news-action-btn${likes.liked ? ' liked' : ''}`} onClick={() => handleLike(item._id)}>
                              {likes.liked ? <FaHeart /> : <FaRegHeart />} {likes.count}
                            </button>
                            <button type="button" className="news-action-btn" onClick={() => openModal(item)}>
                              <FaComment /> {(localComments[item._id] || item.comments || []).length}
                            </button>
                            <button type="button" className="news-action-btn" onClick={() => handleShare(item)}>
                              <FaShare />
                            </button>
                            {item.content && (
                              <button type="button" className="news-read-more" onClick={() => openModal(item)}>
                                Read <FaAngleRight />
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {filtered.length > 0 && (
              <div className="news-search-results-header">
                <FaSearch /> Search results {search && <>(<strong>"{search}"</strong>)</>}
                <span className="news-search-results-count">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="news-grid">
              {filtered.map((item) => {
                const embedUrl = item.mediaType === 'video' ? getYouTubeEmbed(item.mediaUrl) : '';
                const likes = localLikes[item._id] || { count: 0, liked: false };
                return (
                  <article key={item._id} className={`news-grid-card news-grid-card-${item.mediaType}`}>
                    {item.mediaType === 'image' && item.mediaUrl && (
                      <div className="news-grid-card-media" onClick={() => openModal(item)}>
                        <img src={item.mediaUrl} alt={item.title} />
                        <span className="news-grid-card-media-badge"><FaImage /></span>
                      </div>
                    )}
                    {item.mediaType === 'video' && embedUrl && (
                      <div className="news-grid-card-media" onClick={() => openModal(item)}>
                        <iframe src={embedUrl} title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
                        <span className="news-grid-card-media-badge"><FaYoutube /></span>
                      </div>
                    )}
                    {item.mediaType === 'text' && (
                      <div className="news-grid-card-text-icon" onClick={() => openModal(item)}>
                        <FaNewspaper />
                      </div>
                    )}
                    <div className="news-grid-card-body">
                      <div className="news-grid-card-meta">
                        <span><FaCalendarAlt /> <TimeAgo date={item.createdAt} /></span>
                        <span><FaUser /> {item.author}</span>
                      </div>
                      <h3 onClick={() => openModal(item)}>{item.title}</h3>
                      <div className="news-grid-card-actions">
                        <button type="button" className={`news-action-btn${likes.liked ? ' liked' : ''}`} onClick={() => handleLike(item._id)}>
                          {likes.liked ? <FaHeart /> : <FaRegHeart />} {likes.count}
                        </button>
                        <button type="button" className="news-action-btn" onClick={() => openModal(item)}>
                          <FaComment /> {(localComments[item._id] || item.comments || []).length}
                        </button>
                        <button type="button" className="news-action-btn" onClick={() => handleShare(item)}>
                          <FaShare />
                        </button>
                        {item.content && (
                          <button type="button" className="news-read-more" onClick={() => openModal(item)}>
                            Read <FaAngleRight />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {news.length === 0 && (
          <div className="news-empty">
            <div className="news-empty-icon"><FaNewspaper /></div>
            <h3>No news yet</h3>
            <p>Check back later for the latest updates and announcements from CS hub (iCT).</p>
          </div>
        )}

        {filtered.length === 0 && news.length > 0 && (search || filterType !== 'all') && (
          <div className="news-empty">
            <div className="news-empty-icon"><FaSearch /></div>
            <h3>No results found</h3>
            <p>Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-overlay news-modal-overlay" onClick={closeModal}>
          <div className="modal-content news-modal" onClick={(e) => e.stopPropagation()}>
            <div className="news-modal-header">
              <div className="news-modal-header-meta">
                {selected.mediaType !== 'text' && <span className={`news-featured-badge news-featured-badge-${selected.mediaType}`}>{getMediaIcon(selected.mediaType)}</span>}
                <span><FaCalendarAlt /> {formatDate(selected.createdAt)}</span>
                <span><FaUser /> {selected.author}</span>
              </div>
              <button type="button" className="news-modal-close" onClick={closeModal} aria-label="Close"><FaTimes /></button>
            </div>

            <div className="news-modal-body">
              <h2 className="news-modal-title">{selected.title}</h2>

              {selected.mediaType === 'image' && selected.mediaUrl && (
                <div className="news-modal-media">
                  <img src={selected.mediaUrl} alt={selected.title} />
                </div>
              )}
              {selected.mediaType === 'video' && getYouTubeEmbed(selected.mediaUrl) && (
                <div className="news-modal-media news-modal-media-video">
                  <iframe src={getYouTubeEmbed(selected.mediaUrl)} title={selected.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              )}

              {selected.content && (
                <div className="news-modal-content">
                  {selected.content.split('\n').map((line, i) => <p key={i}>{line || '\u00A0'}</p>)}
                </div>
              )}

              <div className="news-modal-actions">
                <button type="button" className={`news-modal-action-btn${selectedLikes?.liked ? ' liked' : ''}`} onClick={() => { handleLike(selected._id); }}>
                  {selectedLikes?.liked ? <FaHeart /> : <FaRegHeart />}
                  <span>{selectedLikes?.count || 0} Like{selectedLikes?.count !== 1 ? 's' : ''}</span>
                </button>
                <button type="button" className="news-modal-action-btn" onClick={() => handleShare(selected)}>
                  <FaShare /> <span>Share</span>
                </button>
              </div>

              <div className="news-modal-comments">
                <h4><FaComment /> Comments <span>({selectedComments.length})</span></h4>

                <div className="news-modal-comments-list">
                  {selectedComments.length === 0 ? (
                    <div className="news-modal-comments-empty">
                      <FaComment />
                      <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    selectedComments.map((c, i) => (
                      <div key={i} className="news-modal-comment">
                        <div className="news-modal-comment-avatar">
                          {c.userName?.charAt(0).toUpperCase() || <FaUser />}
                        </div>
                        <div className="news-modal-comment-body">
                          <div className="news-modal-comment-head">
                            <strong>{c.userName}</strong>
                            <TimeAgo date={c.createdAt} />
                          </div>
                          <p>{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={msgEndRef} />
                </div>

                {user ? (
                  <div className="news-modal-comment-form">
                    <div className="news-modal-comment-avatar small">
                      {user.name?.charAt(0).toUpperCase() || <FaUser />}
                    </div>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(selected._id); } }}
                    />
                    <button type="button" className="btn btn-sm" disabled={submitting || !commentText.trim()} onClick={() => handleComment(selected._id)}>
                      {submitting ? <span className="btn-spinner" /> : <FaPaperPlane />}
                    </button>
                  </div>
                ) : (
                  <div className="news-modal-comment-login">
                    <FaUser /> <button type="button" className="btn-link" onClick={closeModal}>Sign in</button> to leave a comment.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
