import { useState, useEffect } from 'react';
import { FaBookOpen, FaClock, FaSignal, FaArrowLeft, FaTag, FaUser } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const CATEGORY_ICONS = {
  hardware: '💻', software: '🖥️', network: '🌐', virus: '🛡️', training: '📚', general: '📖',
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
      {CATEGORY_ICONS[cat] || '📖'} {cat}
    </span>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then(setCourses)
      .catch(() => {});
  }, []);

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || c.category === filterCat;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(courses.map((c) => c.category))];

  if (selected) {
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
