import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaNewspaper, FaYoutube, FaArrowRight } from 'react-icons/fa';
import API_BASE from '../api';

export default function NewsPreview() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/news`)
      .then((r) => r.json())
      .then((data) => setNews(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  if (news.length === 0) return null;

  return (
    <section id="news" className="section-reveal section-alt" style={{ padding: '2.5rem 1rem' }}>
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
