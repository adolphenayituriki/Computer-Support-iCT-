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
      <button className="fixed bottom-[90px] right-6 z-[999] flex items-center justify-center gap-2 px-[1.15rem] py-3 rounded-full bg-gradient-to-br from-[#5694F7] to-blue-500 text-white shadow-lg shadow-blue-500/40 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/55 transition-all duration-300" onClick={() => setOpen(true)} title="Register for Session">
        <FaPenFancy />
        <span className="text-[0.82rem] font-semibold whitespace-nowrap">Register for Session</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} wide>
        <SessionInvite onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}
