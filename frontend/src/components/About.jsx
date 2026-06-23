import ImageCarousel from './ImageCarousel';

export default function About() {
  return (
    <section id="about" className="about section-reveal">
      <h2 className="section-title">Our Story</h2>
      <div className="about-grid">
        <div className="about-text">
          <p>
            CS hub (iCT) was born from a simple observation:
            many students struggled with setting up their computers, had low digital skills, and lacked the 
            ICT knowledge needed to succeed in their courses and careers.
          </p>
          <p>
            Our founders saw that this digital gap was holding back talented students and teachers from 
            competing globally. They realized that ICT is the most powerful tool to help everyone — 
            students, teachers, and staff — apply their work digitally and reach global standards.
          </p>
          <p>
            Today we are a student-run initiative dedicated to making technology accessible. 
            No jargon, no judgement — just real help from people who understand the struggle.
          </p>
        </div>
        <div className="about-carousel">
          <ImageCarousel />
        </div>
      </div>
    </section>
  );
}
