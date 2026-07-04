import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaUser, FaKey, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SettingsModal({ onClose }) {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('profile');

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setSavingProfile(true);
    try {
      await updateProfile(profile.name, profile.email);
      showToast('Profile updated!');
      setProfileMsg('saved');
    } catch (err) {
      setProfileMsg(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    if (pwd.newPwd !== pwd.confirm) return setPwdMsg('Passwords do not match.');
    if (pwd.newPwd.length < 6) return setPwdMsg('Password must be at least 6 characters.');
    setSavingPwd(true);
    try {
      await changePassword(pwd.current, pwd.newPwd);
      setPwd({ current: '', newPwd: '', confirm: '' });
      showToast('Password changed!');
      setPwdMsg('saved');
    } catch (err) {
      setPwdMsg(err.message);
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="settings-close" onClick={onClose}><FaTimes /></button>
        <h2 className="settings-title">Settings</h2>

        <div className="settings-tabs">
          <button className={`settings-tab${tab === 'profile' ? ' active' : ''}`} onClick={() => setTab('profile')}>
            <FaUser /> Profile
          </button>
          <button className={`settings-tab${tab === 'security' ? ' active' : ''}`} onClick={() => setTab('security')}>
            <FaKey /> Security
          </button>
        </div>

        {tab === 'profile' && (
          <form onSubmit={handleProfile} className="settings-form">
            <div className="settings-field">
              <label>Full Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
            </div>
            <div className="settings-field">
              <label>Email Address</label>
              <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
            </div>
            {profileMsg && profileMsg !== 'saved' && <p className="settings-error">{profileMsg}</p>}
            {profileMsg === 'saved' && <p className="settings-success">Profile saved.</p>}
            <button type="submit" className="settings-btn" disabled={savingProfile}>
              {savingProfile ? <><span className="btn-spinner"></span> Saving...</> : 'Save Changes'}
            </button>
          </form>
        )}

        {tab === 'security' && (
          <form onSubmit={handlePassword} className="settings-form">
            <div className="settings-field">
              <label>Current Password</label>
              <div className="settings-pwd-wrap">
                <input type={showPwd.current ? 'text' : 'password'} value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} required />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd({ ...showPwd, current: !showPwd.current })}>
                  {showPwd.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="settings-field">
              <label>New Password</label>
              <div className="settings-pwd-wrap">
                <input type={showPwd.newPwd ? 'text' : 'password'} value={pwd.newPwd} onChange={(e) => setPwd({ ...pwd, newPwd: e.target.value })} required minLength={6} />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd({ ...showPwd, newPwd: !showPwd.newPwd })}>
                  {showPwd.newPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="settings-field">
              <label>Confirm New Password</label>
              <div className="settings-pwd-wrap">
                <input type={showPwd.confirm ? 'text' : 'password'} value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} required />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })}>
                  {showPwd.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {pwdMsg && pwdMsg !== 'saved' && <p className="settings-error">{pwdMsg}</p>}
            {pwdMsg === 'saved' && <p className="settings-success">Password updated.</p>}
            <button type="submit" className="settings-btn" disabled={savingPwd}>
              {savingPwd ? <><span className="btn-spinner"></span> Updating...</> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}