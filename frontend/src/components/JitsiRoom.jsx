import { useState, useEffect, useRef, useCallback } from 'react';

const JITSI_DOMAIN = 'meet.jit.si';

export default function JitsiRoom({ roomName, displayName, email, onMeetingEnd, settings = {} }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState(0);

  const handleMeetingEnd = useCallback(() => {
    onMeetingEnd?.();
  }, [onMeetingEnd]);

  useEffect(() => {
    if (!roomName || !containerRef.current) return;

    const loadJitsiScript = () => new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) { resolve(); return; }
      const script = document.createElement('script');
      script.src = `https://${JITSI_DOMAIN}/external_api.js`;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Jitsi Meet API'));
      document.head.appendChild(script);
    });

    let mounted = true;

    loadJitsiScript().then(() => {
      if (!mounted || !containerRef.current) return;

      const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName,
        parentNode: containerRef.current,
        userInfo: { displayName, email },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: true,
          disableDeepLinking: true,
          defaultLanguage: 'en',
          toolbarButtons: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'hangup', 'chat', 'recording', 'settings', 'videoquality',
            'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'select-background', 'mute-everyone', 'security',
          ],
          disableRemoveAllParticipantsButton: false,
          enableInsecureRoomNameWarning: false,
          participantsPane: { enabled: true },
          hideConferenceSubject: false,
          hideConferenceTimer: false,
          roomName: roomName,
          enableWelcomePage: false,
          enableClosePage: false,
          notifications: [],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          'SHOW_LOGIN_MORE_BUTTONS': false,
          SHOW_DEEP_LINKING_IMAGE: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
          TOOLBAR_ALWAYS_VISIBLE: true,
          DEFAULT_BACKGROUND: '#0f172a',
          TOOLBAR_BG_COLOR: '#0f172a',
          TOOLBAR_HEIGHT: 48,
          SIDE_TOOLBAR_CONTAINER_COLOR: '#1e293b',
          PARTICIPANT_PANEL_BG_COLOR: '#1e293b',
          FILM_STRIP_MAX_HEIGHT: 120,
          TILE_VIEW_MAX_COLUMNS: 4,
        },
        devices: {
          audioInput: true,
          audioOutput: true,
          videoInput: true,
        },
      });

      apiRef.current = api;

      api.addEventListener('readyToClose', handleMeetingEnd);
      api.addEventListener('participantJoined', () => {
        setParticipants((p) => p + 1);
      });
      api.addEventListener('participantLeft', () => {
        setParticipants((p) => Math.max(0, p - 1));
      });
      api.addEventListener('videoConferenceJoined', () => {
        setParticipants((p) => p + 1);
      });
      api.addEventListener('videoConferenceLeft', handleMeetingEnd);
      api.addEventListener('error', (e) => {
        console.error('Jitsi error:', e);
      });

      setLoading(false);

      if (settings.muteParticipants) {
        api.addEventListener('participantJoined', (event) => {
          api.muteParticipant(event.id, true, true);
        });
      }
    }).catch((e) => {
      if (mounted) setError(e.message);
    });

    return () => {
      mounted = false;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, email, handleMeetingEnd, settings.muteParticipants]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-white gap-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-red-400">Failed to load video room</p>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
        </div>
        <button onClick={handleMeetingEnd} className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">Go Back</button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-slate-950">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cshub-yellow" />
            <p className="text-xs font-medium text-slate-400">Joining room...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
