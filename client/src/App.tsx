import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  Check,
  ChevronRight,
  Cloud,
  Flower2,
  Gamepad2,
  Heart,
  LockKeyhole,
  Mail,
  Pause,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  WandSparkles,
} from "lucide-react";
import { animate, createTimeline, stagger } from "animejs";
import { content, getProtectedMediaUrl, type FocusTrack } from "./content/config";

const apiUrl = (import.meta.env.PROD ? "" : import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [viewerName, setViewerName] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.55);
  const [focusTrack, setFocusTrack] = useState<FocusTrack | null>(null);
  const backgroundAudio = useRef<HTMLAudioElement>(null);
  const focusAudio = useRef<HTMLAudioElement>(null);
  const handleFocus = useCallback(
    (track: FocusTrack | null) => setFocusTrack(track),
    [],
  );

  const playBackground = async () => {
    try {
      const audio = backgroundAudio.current;
      if (!audio) return;
      await audio.play();
    } catch {
      setPlaying(false);
    }
  };
  const unlock = async () => {
    const entered = name.trim();
    if (!entered) {
      setError("A tiny name is needed to open the door ✨");
      return;
    }
    setError("");
    try {
      const response = await fetch(`${apiUrl}/api/auth/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: entered, displayMode: "browser" }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "The little key did not fit.");
      }
    } catch (unlockError) {
      setError(
        unlockError instanceof Error
          ? unlockError.message
          : "The little door is having a shy moment. Try again soon.",
      );
      return;
    }
    setViewerName(entered);
    requestAnimationFrame(() => {
      createTimeline({ defaults: { ease: "out(4)" } })
        .add(".door-panel", { translateY: -110, opacity: 0, duration: 900 })
        .add(".gate-shell", { scale: 1.07, opacity: 0, duration: 500 }, "-=450");
      animate(".petal", {
        translateY: [-10, 100],
        rotate: 180,
        opacity: [1, 0],
        delay: stagger(80),
        duration: 1400,
      });
    });
    setUnlocked(true);
    window.setTimeout(() => void playBackground(), 0);
  };

  useEffect(() => {
    const background = backgroundAudio.current;
    if (!background) return;
    background.volume = muted ? 0 : volume;
    if (focusAudio.current) focusAudio.current.volume = muted ? 0 : volume;
  }, [volume, muted, unlocked]);
  useEffect(() => {
    if (!unlocked) return;
    const resume = () => void playBackground();
    window.addEventListener("pointerdown", resume, { once: true });
    return () => window.removeEventListener("pointerdown", resume);
  }, [unlocked]);
  useEffect(() => {
    const focus = focusAudio.current;
    if (focusTrack && focus) {
      backgroundAudio.current?.pause();
      focus.currentTime = 0;
      focus.volume = muted ? 0 : volume;
      void focus.play().catch(() => undefined);
    } else if (!focusTrack && unlocked) {
      void playBackground();
    }
  }, [focusTrack, unlocked, muted, volume]);

  if (!unlocked)
    return (
      <UnlockGate
        name={name}
        setName={setName}
        error={error}
        onUnlock={unlock}
      />
    );
  return (
    <div className="app-shell">
      <Petals />
      <audio
        ref={backgroundAudio}
        src={content.playlist[0].src}
        loop
        preload="auto"
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      />
      {focusTrack && (
        <audio
          ref={focusAudio}
          src={focusTrack.audioSrc}
          loop
          preload="auto"
          playsInline
        />
      )}
      <MusicPill
        playing={playing}
        muted={muted}
        volume={volume}
        onToggle={() =>
          playing ? backgroundAudio.current?.pause() : void playBackground()
        }
        onMute={() => setMuted((value) => !value)}
        onVolume={setVolume}
      />
      <main className="main-page">
        <Hero viewerName={viewerName} />
        <ExamCare onFocus={handleFocus} />
        <Gallery />
        <VideoMoments />
        <Compliments />
        <Games />
        <Letters />
        <SayHi />
        <FinalNote viewerName={viewerName} />
      </main>
    </div>
  );
}

function UnlockGate({
  name,
  setName,
  error,
  onUnlock,
}: {
  name: string;
  setName: (value: string) => void;
  error: string;
  onUnlock: () => void;
}) {
  return (
    <div className="gate">
      <Petals />
      <div className="floating-cloud cloud-one">
        <Cloud />
      </div>
      <div className="floating-cloud cloud-two">
        <Cloud />
      </div>
      <div className="gate-shell">
        <div className="gate-kicker">
          <Sparkles size={14} /> a tiny surprise
        </div>
        <div className="door-panel">
          <div className="door-stars">✦　·　✧</div>
          <div className="keyhole">
            <LockKeyhole size={30} />
          </div>
          <div className="door-handle" />
        </div>
        <div className="gate-copy">
          <p className="eyebrow">Who's this surprise for?</p>
          <h1>
            A little corner
            <br />
            <em>just for you</em>
          </h1>
          <p className="gate-subtitle">
            There is a tiny starlit door waiting to be opened.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onUnlock();
            }}
          >
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="type your name..."
              autoComplete="off"
            />
            <button className="primary-button" type="submit">
              Unlock <ChevronRight size={18} />
            </button>
          </form>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
      <p className="gate-footer">
        made with a little sparkle and good intentions <span>♡</span>
      </p>
    </div>
  );
}

function Petals() {
  return (
    <div className="petal-rain" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <i
          className="petal"
          key={index}
          style={{
            left: `${(index * 17) % 100}%`,
            animationDelay: `${index * -0.7}s`,
            animationDuration: `${7 + (index % 4)}s`,
          }}
        >
          ✿
        </i>
      ))}
    </div>
  );
}

function MusicPill({
  playing,
  muted,
  volume,
  onToggle,
  onMute,
  onVolume,
}: {
  playing: boolean;
  muted: boolean;
  volume: number;
  onToggle: () => void;
  onMute: () => void;
  onVolume: (value: number) => void;
}) {
  return (
    <div className="music-pill" role="group" aria-label="Music controls">
      <span className="equalizer">
        {[1, 2, 3, 4].map((number) => (
          <i
            key={number}
            className={playing && !muted ? "bar active" : "bar"}
          />
        ))}
      </span>
      <button
        className="music-action"
        onClick={onToggle}
        aria-label={playing ? "Pause music" : "Play music"}
      >
        {playing ? <Pause size={15} /> : <Play size={15} />}
      </button>
      <span className="music-status">{playing ? "Playing" : "Paused"}</span>
      <span className="music-divider" />
      <button
        className="music-action"
        onClick={onMute}
        aria-label={muted ? "Unmute music" : "Mute music"}
      >
        {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
      <input
        className="volume-slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(event) => onVolume(Math.min(1, Math.max(0, Number(event.target.value))))}
        onInput={(event) => onVolume(Math.min(1, Math.max(0, Number((event.target as HTMLInputElement).value))))}
        style={{ "--volume-fill": `${volume * 100}%` } as React.CSSProperties}
        aria-label="Music volume"
      />
    </div>
  );
}

function Tilt({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const move = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      node.style.setProperty(
        "--rx",
        `${((event.clientY - box.top) / box.height - 0.5) * -8}deg`,
      );
      node.style.setProperty(
        "--ry",
        `${((event.clientX - box.left) / box.width - 0.5) * 10}deg`,
      );
    };
    const leave = () => {
      node.style.setProperty("--rx", "0deg");
      node.style.setProperty("--ry", "0deg");
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <div ref={ref} className={`tilt ${className}`}>
      {children}
    </div>
  );
}

function Hero({ viewerName }: { viewerName: string }) {
  return (
    <section className="hero section-wrap">
      <div className="hero-copy">
        <p className="eyebrow">
          <Sparkles size={14} /> opened especially for you
        </p>
        <h1>
          Hey, <em>{viewerName}</em> <span>✦</span>
        </h1>
        <p className="hero-lede">{content.heroSubtext}</p>
        <div className="hero-actions">
          <a className="scroll-cue" href="#exam">
            <ArrowDown size={16} /> take a little scroll
          </a>
        </div>
      </div>
      <div className="orb-wrap">
        <Tilt className="bunny-cup">
          <div className="cup-glow" />
          <div className="bunny-ear ear-left" />
          <div className="bunny-ear ear-right" />
          <div className="bunny-face">
            <span className="bunny-eye eye-left" />
            <span className="bunny-eye eye-right" />
            <span className="bunny-nose">·ᴗ·</span>
            <span className="bunny-cheek cheek-left">●</span>
            <span className="bunny-cheek cheek-right">●</span>
          </div>
          <div className="bunny-bow">♡</div>
          <div className="cup">
            <i className="cup-tea" />
            <i className="cup-handle" />
          </div>
          <div className="garden-spark spark-one">✦</div>
          <div className="garden-spark spark-two">✧</div>
          {/* <div className="garden-bubble">
            a tiny
            <br />
            tea break
          </div> */}
        </Tilt>
        <div className="orb-caption">
          <Flower2 size={20} /> soft thoughts, sparkly delivery
        </div>
      </div>
      <div className="hero-cloud cloud-a">
        <Cloud />
      </div>
      <div className="hero-cloud cloud-b">
        <Cloud />
      </div>
    </section>
  );
}

function ExamCare({
  onFocus,
}: {
  onFocus: (track: FocusTrack | null) => void;
}) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [showFocus, setShowFocus] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(
      () =>
        setSeconds((value) => {
          if (value <= 1) {
            setRunning(false);
            onFocus(null);
            return 25 * 60;
          }
          return value - 1;
        }),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [running, onFocus]);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <section id="exam" className="section-wrap exam-section">
      <div className="section-heading">
        <span className="section-number">01 / care package</span>
        <h2>
          For your exam-season <em>brain</em> 🌸
        </h2>
        <p>{content.examNote}</p>
      </div>
      <div className="care-grid">
        <div className="note-card pink-note">
          <div className="tape" />
          <Flower2 size={22} />
          <p>{content.examNoteTwo}</p>
          <div className="note-sign">— your tiny cheer squad</div>
          <div className="note-stamp">
            YOU
            <br />
            GOT
            <br />
            THIS
          </div>
        </div>
        <div className="pomodoro-card">
          <div className={`bunny ${running ? "bunny-hop" : ""}`}>🐰</div>
          <div className="timer-content">
            <span className="card-label">
              {running ? "bunny is focusing" : "focus bunny"}
            </span>
            <strong>{time}</strong>
            <div className="timer-track">
              <i
                style={{ width: `${((25 * 60 - seconds) / (25 * 60)) * 100}%` }}
              />
            </div>
            <div className="timer-actions">
              {running ? (
                <button
                  className="focus-start"
                  onClick={() => {
                    setRunning(false);
                    onFocus(null);
                  }}
                >
                  <Pause size={18} /> pause focus
                </button>
              ) : (
                <button
                  className="focus-start"
                  onClick={() => setShowFocus(true)}
                >
                  <Play size={18} fill="currentColor" /> start focus mode
                </button>
              )}
              <button
                className="reset-button"
                onClick={() => {
                  setRunning(false);
                  setSeconds(25 * 60);
                  onFocus(null);
                }}
                aria-label="Reset timer"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="reminder-row">
        <span>💧 water break?</span>
        <span>🧘 stretch those shoulders</span>
        <span>🍪 snack science says yes</span>
      </div>
      {showFocus && (
        <FocusModal
          onClose={() => setShowFocus(false)}
          onStart={(track) => {
            setShowFocus(false);
            setRunning(true);
            setSeconds(track.minutes * 60);
            onFocus(track);
          }}
        />
      )}
    </section>
  );
}

function FocusModal({
  onClose,
  onStart,
}: {
  onClose: () => void;
  onStart: (track: FocusTrack) => void;
}) {
  const [minutes, setMinutes] = useState(25);
  const [selected, setSelected] = useState(content.focusTracks[0]);
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-title"
    >
      <div className="focus-modal">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close focus setup"
        >
          ×
        </button>
        <span className="section-number">focus setup</span>
        <h2 id="focus-title">
          Make a tiny study <em>nest</em>
        </h2>
        <label>
          How long?{" "}
          <select
            value={minutes}
            onChange={(event) => setMinutes(Number(event.target.value))}
          >
            <option value="10">10 minutes</option>
            <option value="25">25 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </label>
        <p className="spotify-note">
          Pick one of the pre-added focus sounds below. Your background music
          will pause until the timer ends.
        </p>
        <div className="focus-track-list">
          {content.focusTracks.map((track) => (
            <button
              className={`focus-track ${selected.id === track.id ? "selected" : ""}`}
              key={track.id}
              onClick={() => setSelected(track)}
            >
              <img src={track.thumbnail} alt="" />
              <span>
                <b>{track.title}</b>
                <small>
                  {track.artist} · {track.duration}
                </small>
              </span>
              <Check className="track-check" size={17} />
            </button>
          ))}
        </div>
        <button
          className="primary-button focus-go"
          onClick={() => onStart({ ...selected, minutes })}
        >
          <Play size={18} fill="currentColor" /> begin focus mode
        </button>
      </div>
    </div>
  );
}

function Gallery() {
  const [selected, setSelected] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [photos, setPhotos] = useState<Array<{ path: string; alt: string; caption: string }>>(
    [...content.gallery],
  );
  const loadPhotos = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/media/list?refresh=${Date.now()}`,
        { credentials: "include", cache: "no-store" },
      );
      if (!response.ok) throw new Error("gallery unavailable");
      const result = await response.json() as {
        photos?: Array<{ path: string; alt: string; caption: string }>;
      };
      if (result.photos?.length) {
        setPhotos(result.photos);
        setSelected((current) => Math.min(current, result.photos!.length - 1));
      }
    } catch {
      // Keep the configured gallery when storage discovery is unavailable.
    } finally {
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    void loadPhotos();
    const refreshTimer = window.setInterval(() => void loadPhotos(), 30_000);
    window.addEventListener("focus", loadPhotos);
    document.addEventListener("visibilitychange", loadPhotos);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", loadPhotos);
      document.removeEventListener("visibilitychange", loadPhotos);
    };
  }, [loadPhotos]);
  return (
    <section className="section-wrap gallery-section">
      <div className="section-heading">
        <span className="section-number">02 / little things</span>
        <h2>
          A few things that made <em>me smile</em>
        </h2>
        <p>These are yours to fill with real memories from Supabase Storage.</p>
        <button className="gallery-refresh" type="button" onClick={loadPhotos} disabled={refreshing}>
          {refreshing ? "checking the shelf..." : "refresh memories"}
        </button>
      </div>
      <div className="memory-gallery">
        <div className="gallery-main">
          <ProtectedImage
            path={photos[selected]?.path ?? content.gallery[0].path}
            alt={photos[selected]?.alt ?? content.gallery[0].alt}
          />
          {/* <span className="gallery-shine">✦</span> */}
        </div>
        <div className="gallery-strip" aria-label="Photo memories">
          {photos.map((photo, index) => (
            <button
              className={`gallery-card ${selected === index ? "selected" : ""}`}
              key={photo.path}
              onClick={() => setSelected(index)}
              aria-label={`View ${photo.caption}`}
            >
              <ProtectedImage path={photo.path} alt="" />
              <span>{photo.caption}</span>
            </button>
          ))}
        </div>
      </div>
      {photos.length === 0 && (
        <p className="gallery-empty">A few little memories are on their way ✨</p>
      )}
    </section>
  );
}

function VideoMoments() {
  return (
    <section className="section-wrap video-section">
      <div className="section-heading">
        <span className="section-number">02.5 / little moving moments</span>
        <h2>Some things are nicer <em>in motion</em></h2>
        <p>Quiet little clips from the private surprise shelf — always muted and easy on mobile data.</p>
      </div>
      <div className="video-grid">
        {content.videos.map((video) => (
          <article className="video-card" key={video.path}>
            <ProtectedVideo path={video.path} title={video.title} />
            <div className="video-card-copy">
              <span>✦ muted memory</span>
              <h3>{video.title}</h3>
              <p>{video.caption}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function useProtectedMedia(path: string) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    void fetch(getProtectedMediaUrl(path), { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("media unavailable");
        return response.blob();
      })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setUrl("");
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);
  return url;
}

function ProtectedImage({ path, alt }: { path: string; alt: string }) {
  const src = useProtectedMedia(path);
  return <img src={src || "/gallery-placeholder-1.svg"} alt={alt} />;
}

function ProtectedVideo({ path, title }: { path: string; title: string }) {
  const src = useProtectedMedia(path);
  const [aspectRatio, setAspectRatio] = useState("9 / 13");
  return (
    <div className="video-frame" style={{ aspectRatio }}>
      <video
        src={src || undefined}
        muted
        autoPlay
        loop
        playsInline
        preload="metadata"
        aria-label={title}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          if (video.videoWidth && video.videoHeight) {
            setAspectRatio(`${video.videoWidth} / ${video.videoHeight}`);
          }
        }}
      />
    </div>
  );
}

function Compliments() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <section className="section-wrap compliment-section">
      <div className="section-heading">
        <span className="section-number">03 / an observation</span>
        <h2>
          Things I've noticed <em>about you</em>
        </h2>
        <p className="section-muted">Tap each card to reveal the soft part.</p>
      </div>
      <div className="compliment-grid">
        {content.compliments.map(([number, title, text]) => (
          <button
            className={`compliment-card ${selected === number ? "is-flipped" : ""}`}
            key={number}
            onClick={() => setSelected(selected === number ? null : number)}
          >
            {selected === number ? (
              <div className="card-face card-back">
                <Sparkles size={20} />
                <h3>this one is yours</h3>
                <p>{text}</p>
                <span>♡ with admiration</span>
              </div>
            ) : (
              <div className="card-face card-front">
                <span>{number}</span>
                <Heart size={20} />
                <div className="card-orbit">✦</div>
                <h3>{title}</h3>
                <p>tap to turn this thought over</p>
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function Games() {
  const [answer, setAnswer] = useState("");
  const [memoryCards, setMemoryCards] = useState(() => shuffleCards(["🌸", "🌙", "🌸", "🐰", "🌙", "🐰"]));
  const [memorySelected, setMemorySelected] = useState<number[]>([]);
  const [memoryMatched, setMemoryMatched] = useState<number[]>([]);
  const [memoryLocked, setMemoryLocked] = useState(false);
  const [starMessage, setStarMessage] = useState<string | null>(null);
  const starMessages = [
    "A tiny victory is still a victory ✨",
    "Your future self just sent you a high five 🌸",
    "You make ordinary days feel a little brighter.",
    "Hydration break, clever one. Your brain will thank you.",
    "You are allowed to take up space and take a break.",
  ];
  const questions = [
    "Which tiny break sounds best?",
    "Pick a study mascot:",
    "Your ideal reward is...",
  ];
  const [question, setQuestion] = useState(0);
  const options = [
    ["a cloud nap", "a snack quest", "a victory dance"],
    ["a sleepy bunny", "a brave bear", "a curious cloud"],
    ["a song", "a sunset", "all three"],
  ];
  return (
    <section className="section-wrap games-section">
      <div className="game-copy">
        <span className="section-number">04 / tiny games</span>
        <h2>
          A very scientific <em>vibe quiz</em>
        </h2>
        <p>
          Three questions, zero wrong answers, and one extremely accurate result
          at the end.
        </p>
        <div className="stars-count">
          <Star fill="currentColor" size={18} /> quiz sparks:{" "}
          <strong>{answer ? question + 1 : 0}</strong>
        </div>
      </div>
      <div className="game-card quiz-game-card">
        <div className="game-top">
          <Gamepad2 />
          <span>the smile quiz</span>
          <span className="game-score">{question + 1}/3</span>
        </div>
        <div className="quiz-box">
          <div className="quiz-bunny">🐰</div>
          <h3>{questions[question]}</h3>
          <div className="quiz-options">
            {options[question].map((option) => (
              <button
                key={option}
                className={answer === option ? "chosen" : ""}
                onClick={() => {
                  setAnswer(option);
                  if (question < 2)
                    window.setTimeout(() => {
                      setQuestion((value) => value + 1);
                      setAnswer("");
                    }, 500);
                }}
              >
                {option}
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
          {question === 2 && answer && (
            <p className="quiz-result">Result: {answer} energy ✨</p>
          )}
        </div>
        <p className="game-hint">A tiny break is still a productive break.</p>
      </div>
      <div className="extra-games">
        <div className="game-card mini-game-card">
          <div className="game-top">
            <span>🌸 memory garden</span>
            <button
              className="game-reset"
              onClick={() => {
                setMemoryCards(shuffleCards(["🌸", "🌙", "🌸", "🐰", "🌙", "🐰"]));
                setMemorySelected([]);
                setMemoryMatched([]);
                setMemoryLocked(false);
              }}
              aria-label="Reset memory garden"
            >
              <RotateCcw size={13} /> reset
            </button>
          </div>
          <div className="game-score">{memoryMatched.length / 2}/3 pairs</div>
          <p>Find the matching pairs. The flowers are cheering you on.</p>
          <div className="memory-grid">
            {memoryCards.map((card, index) => (
              <button
                className={memorySelected.includes(index) || memoryMatched.includes(index) ? "revealed" : ""}
                key={index}
                onClick={() => {
                  if (memoryLocked || memoryMatched.includes(index) || memorySelected.includes(index)) return;
                  const next = [...memorySelected, index];
                  setMemorySelected(next);
                  if (next.length !== 2) return;
                  setMemoryLocked(true);
                  if (memoryCards[next[0]] === card) {
                    setMemoryMatched((value) => [...value, ...next]);
                    window.setTimeout(() => {
                      setMemorySelected([]);
                      setMemoryLocked(false);
                    }, 350);
                  } else {
                    window.setTimeout(() => {
                      setMemorySelected([]);
                      setMemoryLocked(false);
                    }, 850);
                  }
                }}
              >
                {memorySelected.includes(index) || memoryMatched.includes(index) ? card : "✦"}
              </button>
            ))}
          </div>
        </div>
        <div className="game-card mini-game-card star-pocket-card">
          <div className="game-top">
            <span>✨ pocket stars</span>
            <span className="game-score">{starMessage ? "opened" : "pick one"}</span>
          </div>
          <p>Pick a little star and see what it has been saving for you.</p>
          <div className="star-pocket">
            {starMessages.map((message, index) => (
              <button
                key={message}
                className={starMessage === message ? "picked" : ""}
                aria-label={`Pick star ${index + 1}`}
                onClick={() => setStarMessage(message)}
              >
                {["✦", "✧", "★", "✺", "✷"][index]}
              </button>
            ))}
          </div>
          {starMessage && (
            <div className="star-message">
              <span>♡</span>
              <strong>{starMessage}</strong>
              <button onClick={() => setStarMessage(null)}>pick again</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function shuffleCards(cards: string[]) {
  return [...cards].sort(() => Math.random() - 0.5);
}

function Letters() {
  const [open, setOpen] = useState<string | null>(null);
  const letters = [
    [
      "smile",
      "Open when you need a smile",
      "You are allowed to have a soft day. Here is a tiny reminder that someone is quietly cheering for you.",
    ],
    [
      "exam",
      "Open when exams feel heavy",
      "One page at a time. Drink water, unclench your shoulders, and remember that a difficult chapter is not the whole story.",
    ],
    [
      "bored",
      "Open when you are bored",
      "Go find a cloud, a snack, or a song you have never heard. Tiny adventures count too.",
    ],
  ];
  return (
    <section className="letters-section">
      <div className="section-wrap">
        <div className="section-heading">
          <span className="section-number">05 / a few folded thoughts</span>
          <h2>
            A small drawer of <em>gentle reminders</em>
          </h2>
          <p>
            Three little envelopes, each waiting for exactly the right sort of
            moment.
          </p>
        </div>
        <div className="letter-drawer">
          {letters.map(([id, title, text], index) => (
            <article
              className={`letter-card letter-${index} ${open === id ? "open" : ""}`}
              key={id}
            >
              <button onClick={() => setOpen(open === id ? null : id)}>
                <span className="envelope-icon">{open === id ? "✿" : "✉"}</span>
                <b>{title}</b>
                <span className="letter-toggle">
                  {open === id ? "close" : "open"}
                </span>
              </button>
              {open === id && (
                <div className="letter-content">
                  <p>{text}</p>
                  <small>folded with care ✦</small>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SayHi() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  return (
    <section className="section-wrap say-hi">
      <div className="postbox">
        <Mail size={38} />
        <div className="postbox-slot" />
        <div className="postbox-flower">✿</div>
      </div>
      <div>
        <span className="section-number">06 / optional postbox</span>
        <h2>
          Say hi <em>back?</em>
        </h2>
        <p>Only if you feel like it 🌸 No reply needed, ever.</p>
        {sent ? (
          <div className="sent-message">
            <Check size={17} /> message tucked away safely
          </div>
        ) : (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const message = new FormData(form).get("message");
              if (typeof message !== "string" || !message.trim()) return;
              setSending(true);
              setError("");
              try {
                const response = await fetch(`${apiUrl}/api/messages`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ message }),
                });
                if (!response.ok) throw new Error("send failed");
                setSent(true);
              } catch {
                setError("The little postbox missed that. Try once more.");
              } finally {
                setSending(false);
              }
            }}
          >
            <textarea
              name="message"
              aria-label="Your message"
              placeholder="a tiny hello, a snack recommendation, or a little update..."
            />
            <button className="primary-button" type="submit" disabled={sending}>
              {sending ? "Tucking it away..." : "Send a little note"} <Send size={16} />
            </button>
            {error && <small className="form-error">{error}</small>}
          </form>
        )}
      </div>
    </section>
  );
}

function FinalNote({ viewerName }: { viewerName: string }) {
  return (
    <footer className="final-note section-wrap">
      <div className="confetti">✦　✧　✦　·　✧　✦</div>
      <WandSparkles size={28} />
      <h2>
        Thanks for being <em>you</em>
      </h2>
      <p>
        Good luck with your exams, {viewerName}. You’ve got this — one page, one
        breath, one tiny victory at a time.
      </p>
      <div className="footer-line">
        <span>made with care</span>
        <Heart size={14} fill="currentColor" />
        <span>no pressure, promise</span>
      </div>
    </footer>
  );
}

export default App;
