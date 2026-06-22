export default function CTA({ onRegisterClick, onTeamClick }) {
  return (
    <section id="cta" className="cta-section section-reveal">
      <div className="container">
        <h2>Ready to Join?</h2>
        <p>
          Whether you are a student, teacher, or staff anywhere in Rwanda, 
          we are here to help you build digital skills and keep your computer running.
          Sign up today.
        </p>
        <div className="cta-btns">
          <button className="btn" onClick={onRegisterClick}>Create Account</button>
          <button className="btn btn-outline" onClick={onTeamClick}>Join Our Team</button>
        </div>
      </div>
    </section>
  );
}
