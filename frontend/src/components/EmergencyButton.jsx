import { useState } from 'react';
import { FaPenFancy } from 'react-icons/fa';
import Modal from './Modal';
import SessionInvite from './SessionInvite';

export default function EmergencyButton() {
  const [open, setOpen] = useState(false);

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
