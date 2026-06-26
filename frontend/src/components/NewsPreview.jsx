import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaNewspaper, FaYoutube, FaImage, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

export default function NewsPreview() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => setNews(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  if (news.length === 0) return null;

  return (
    <section id="news" className="section-reveal" style={{ padding: '4rem 1rem', background: '#f8fafc' }}>
      <div className="container">
        <h2 className="section-title">
          <FaNewspaper style={{ color: '#FFCE08', marginRight: '0.5rem' }} />
          Latest News
        </h2>
        <p className="section-sub" style={{ marginBottom: '2rem' }}>Stay updated with the latest from CS hub (iCT)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          {news.map((item) => (
            <Link to="/news" key={item._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', padding: '1rem 1.25rem', alignItems: 'center' }}>
                {item.mediaType === 'image' && item.mediaUrl && (
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.mediaUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                {item.mediaType === 'video' && (
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#fee2e2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#dc2626' }}>
                    <FaYoutube />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <FaCalendarAlt /> {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    {item.mediaType === 'image' && <span style={{ fontSize: '0.65rem', background: '#dbeafe', color: '#1d4ed8', padding: '0.05rem 0.35rem', borderRadius: '999px' }}><FaImage /> Photo</span>}
                    {item.mediaType === 'video' && <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#dc2626', padding: '0.05rem 0.35rem', borderRadius: '999px' }}><FaYoutube /> Video</span>}
                  </div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e1b4b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>
                </div>
                <FaArrowRight style={{ color: '#d1d5db', flexShrink: 0 }} />
              </article>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            View all news <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
