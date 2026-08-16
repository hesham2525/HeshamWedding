import { useEffect, useRef, useState } from "react";
import { WishesAdmin } from "./components/admin/WishesAdmin";
import { DoorScene } from "./components/door/DoorScene";
import { WeddingInvitation } from "./components/invitation/WeddingInvitation";
import { weddingData } from "./data/weddingData";

function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  const [entered, setEntered] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const audioRef = useRef(null);
  const knockAudioRef = useRef(null);
  const doorAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const soundTimersRef = useRef([]);
  const musicStartTimerRef = useRef(null);
  const hasMusic = Boolean(
    weddingData.assets.music.enabled && weddingData.assets.music.src
  );
  const hasKnockSound = Boolean(weddingData.assets.sounds.knock);
  const hasDoorSound = Boolean(weddingData.assets.sounds.doorOpen);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);

    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const clearSoundTimers = () => {
    soundTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    soundTimersRef.current = [];
  };

  const playSound = (audio, volume = 1, options = {}) => {
    if (!audio) return;

    const { startAt = 0, duration = 0 } = options;
    audio.pause();
    audio.currentTime = startAt;
    audio.volume = volume;
    audio.play().catch(() => {});

    if (duration > 0) {
      const timer = window.setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, duration * 1000);

      soundTimersRef.current.push(timer);
    }
  };

  const unlockAudioSilently = (audio) => {
    if (!audio) return;

    const previousVolume = audio.volume;
    audio.volume = 0;
    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = previousVolume || 1;
      })
      .catch(() => {
        audio.volume = previousVolume || 1;
      });
  };

  const playHeavyDoorEffect = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    const context = audioContextRef.current || new AudioContext();
    audioContextRef.current = context;

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    const now = context.currentTime;
    const master = context.createGain();
    master.gain.setValueAtTime(0.85, now);
    master.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
    master.connect(context.destination);

    const thud = context.createOscillator();
    const thudGain = context.createGain();
    thud.type = "sine";
    thud.frequency.setValueAtTime(72, now);
    thud.frequency.exponentialRampToValueAtTime(36, now + 0.28);
    thudGain.gain.setValueAtTime(0.95, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
    thud.connect(thudGain);
    thudGain.connect(master);
    thud.start(now);
    thud.stop(now + 0.36);

    const buffer = context.createBuffer(1, context.sampleRate * 1.15, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < data.length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
    }

    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.linearRampToValueAtTime(950, now + 0.95);
    filter.Q.setValueAtTime(7, now);
    noiseGain.gain.setValueAtTime(0.46, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now + 0.05);
    noise.stop(now + 1.15);
  };

  const playDoorOpen = () => {
    playSound(doorAudioRef.current, 1, { startAt: 0, duration: 2.8 });
    playHeavyDoorEffect();
  };

  const stopMusic = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setMusicEnabled(false);
  };

  const playMusic = () => {
    if (!audioRef.current || !hasMusic) return Promise.resolve();

    audioRef.current.currentTime = 0;
    audioRef.current.volume = 0.54;
    return audioRef.current
      .play()
      .then(() => setMusicEnabled(true))
      .catch(() => setMusicEnabled(false));
  };

  const playMusicAfterEntry = () => {
    if (musicStartTimerRef.current) {
      window.clearTimeout(musicStartTimerRef.current);
    }

    musicStartTimerRef.current = window.setTimeout(() => {
      playMusic();
      musicStartTimerRef.current = null;
    }, 450);
  };

  const toggleMusic = () => {
    if (!audioRef.current || !hasMusic) return;

    if (musicEnabled) {
      audioRef.current.pause();
      setMusicEnabled(false);
      return;
    }

    playMusic();
  };

  useEffect(() => {
    if (!hasMusic || !weddingData.assets.music.startOnLoad) return;
    playMusic();
  }, [hasMusic]);

  useEffect(
    () => () => {
      clearSoundTimers();

      if (musicStartTimerRef.current) {
        window.clearTimeout(musicStartTimerRef.current);
      }
    },
    []
  );

  if (hash === "#admin-wishes") {
    return <WishesAdmin />;
  }

  return (
    <main>
      {hasMusic && (
        <audio
          ref={audioRef}
          src={weddingData.assets.music.src}
          loop
          preload="auto"
        />
      )}
      {hasKnockSound && (
        <audio
          ref={knockAudioRef}
          src={weddingData.assets.sounds.knock}
          preload="auto"
        />
      )}
      {hasDoorSound && (
        <audio
          ref={doorAudioRef}
          src={weddingData.assets.sounds.doorOpen}
          preload="auto"
        />
      )}

      {!entered && (
        <DoorScene
          onKnock={() => {
            clearSoundTimers();
            stopMusic();
            unlockAudioSilently(doorAudioRef.current);
            playSound(knockAudioRef.current, 1, { duration: 0.9 });
          }}
          onDoorOpenStart={playDoorOpen}
          onComplete={() => {
            setEntered(true);
            playMusicAfterEntry();
          }}
        />
      )}
      {entered && (
        <WeddingInvitation
          hasMusic={hasMusic}
          musicEnabled={musicEnabled}
          onToggleMusic={toggleMusic}
        />
      )}
    </main>
  );
}

export default App;
