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
    <section id="news" className="section-reveal section-alt" style={{ padding: '4rem 1rem' }}>
      <div className="container">
        <h2 className="section-title">
          <FaNewspaper className="page-hero-icon" />
          Latest News
        </h2>
        <p className="section-sub">Stay updated with the latest from CS hub (iCT)</p>
        <div className="news-preview-list">
          {news.map((item) => (
            <Link to="/news" key={item._id} className="news-preview-card">
              {item.mediaType === 'image' && item.mediaUrl && (
                <div className="news-preview-thumb">
                  <img src={item.mediaUrl} alt={item.title} />
                </div>
              )}
              {item.mediaType === 'video' && (
                <div className="news-preview-thumb-video">
                  <FaYoutube />
                </div>
              )}
              <div className="news-preview-content">
                <div className="news-card-meta" style={{ marginBottom: '0.25rem' }}>
                  <span>
                    <FaCalendarAlt /> {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  {item.mediaType === 'image' && <span className="badge badge-media-photo"><FaImage /> Photo</span>}
                  {item.mediaType === 'video' && <span className="badge badge-media-video"><FaYoutube /> Video</span>}
                </div>
                <h4>{item.title}</h4>
              </div>
              <FaArrowRight className="news-preview-arrow" />
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/news" className="news-view-all">
            View all news <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
