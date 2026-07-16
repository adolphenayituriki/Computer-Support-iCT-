import { useNavigate } from 'react-router-dom';
import { FaPenFancy } from 'react-icons/fa';

export default function EmergencyButton() {
  const navigate = useNavigate();

  return (
    <button className="emergency-btn-fab" onClick={() => navigate('/session')} title="Register for Session">
      <FaPenFancy />
      <span className="emergency-btn-label">Register Now</span>
    </button>
  );
}
