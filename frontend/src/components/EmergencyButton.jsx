import { useState, useEffect } from 'react';
import { FaPenFancy } from 'react-icons/fa';
import Modal from './Modal';
import SessionInvite from './SessionInvite';

export default function EmergencyButton() {
  const [open, setOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('session') === 'true';
  });

  useEffect(() => {
    if (open) {
      const url = new URL(window.location);
      url.searchParams.delete('session');
      window.history.replaceState({}, '', url);
    }
  }, [open]);

  return (
    <>
      <button className="emergency-btn-fab" onClick={() => setOpen(true)} title="Register for Session">
        <FaPenFancy />
        <span className="emergency-btn-label">Register for Session</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} wide>
        <SessionInvite onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}
