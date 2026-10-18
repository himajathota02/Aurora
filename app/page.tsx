"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AudioLines, ChevronRight, Headphones, Home, LoaderCircle, Music2, Pause, Play, SkipBack, SkipForward, Sparkles, Volume2, VolumeX, Wind, X } from "lucide-react";
import { AffirmationNote } from "../components/affirmations/AffirmationNote";
import { CassetteMusicVideo } from "../components/cassette/CassetteMusicVideo";
import { AudioPlayer, type AudioPlayerController } from "../components/cassette/AudioPlayer";
import { AuroraIntro } from "../components/aurora/AuroraIntro";
import { BirthdayFinaleOverlay } from "../components/aurora/BirthdayFinaleOverlay";
import { FinaleVideoBackground } from "../components/aurora/FinaleVideoBackground";
import { AuroraWorldVideo } from "../components/aurora/AuroraWorldVideo";
import { LanternTransitionVideo, type LanternVideoPhase } from "../components/aurora/LanternTransitionVideo";
import { LanternField } from "../components/aurora/LanternField";
import { wishLanterns as wishData } from "../data/wish-lanterns";
import type { Affirmation, Song } from "../types/content";

type Scene = "intro" | "aurora-world" | "cassette" | "wish-lanterns";

export default function AuroraPage() {
  const [scene, setScene] = useState<Scene>("intro");
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsLoading, setSongsLoading] = useState(true);
  const [songsError, setSongsError] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedLantern, setSelectedLantern] = useState<string | null>(null);
  const [releasedLanterns, setReleasedLanterns] = useState<Set<string>>(() => new Set());
  const [wishReleasing, setWishReleasing] = useState(false);
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [skyTransitioning, setSkyTransitioning] = useState(false);
  const [lanternTransition, setLanternTransition] = useState<LanternVideoPhase>("idle");
  const [auroraWorldReady, setAuroraWorldReady] = useState(false);
  const [finalLanternsVisible, setFinalLanternsVisible] = useState(false);
  const [finalLanternsRevealed, setFinalLanternsRevealed] = useState(false);
  const [finaleBackgroundReady, setFinaleBackgroundReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(65);
  const [ambientOn, setAmbientOn] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const playerRef = useRef<AudioPlayerController | null>(null);
  const closeNoteTimer = useRef<number | null>(null);
  const releaseTimer = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambienceGainRef = useRef<GainNode | null>(null);

  const song = activeIndex === null ? null : songs[activeIndex] || null;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/songs", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("The local Songs folder could not be read.");
        return response.json() as Promise<{ songs: Song[] }>;
      })
      .then((result) => {
        if (!cancelled) {
          setSongs(result.songs);
          setSongsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSongsError("Couldn't open your song folder.");
          setSongsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => {
    if (closeNoteTimer.current) window.clearTimeout(closeNoteTimer.current);
    if (releaseTimer.current) window.clearTimeout(releaseTimer.current);
    void audioContextRef.current?.close();
  }, []);

  const onPlayerPlaying = useCallback((playing: boolean) => {
    setIsPlaying(playing);
    if (playing) setPlayerError("");
  }, []);
  const onPlayerProgress = useCallback((time: number, total: number) => {
    setCurrentTime(time);
    setDuration(total);
  }, []);
  const onPlayerReady = useCallback(() => setPlayerLoading(false), []);
  const onFinaleBackgroundReady = useCallback(() => setFinaleBackgroundReady(true), []);
  const onAuroraWorldReady = useCallback(() => setAuroraWorldReady(true), []);
  const onAuroraWorldLoadError = useCallback(() => setAuroraWorldReady(true), []);
  const onPlayerLoading = useCallback(() => {
    setPlayerLoading(true);
    setPlayerError("");
  }, []);
  const onPlayerError = useCallback((message: string) => {
    setPlayerLoading(false);
    setPlayerError(message);
    setIsPlaying(false);
  }, []);
  const onPlayerEnded = useCallback(() => {
    if (!songs.length) return;
    const nextIndex = activeIndex === null ? 0 : (activeIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    if (!nextSong?.audioUrl) {
      setPlayerError("That song isn't available just now.");
      return;
    }
    setActiveIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
    setPlayerError("");
    playerRef.current?.playTrack(nextSong.audioUrl);
  }, [activeIndex, songs]);

  const enterAuroraWorld = () => {
    if (scene !== "intro") return;
    setFinalLanternsVisible(false);
    setFinalLanternsRevealed(false);
    setFinaleBackgroundReady(false);
    setSelectedLantern(null);
    setAffirmation(null);
    setLanternTransition("idle");
    setScene("aurora-world");
  };

  const openCassette = () => {
    if (scene !== "aurora-world") return;
    setScene("cassette");
  };

  const closeCassette = () => {
    if (scene === "cassette") setScene("aurora-world");
  };

  const startWishChapter = () => {
    if (scene !== "aurora-world") return;
    setSelectedLantern(null);
    setAffirmation(null);
    setFinalLanternsVisible(false);
    setFinalLanternsRevealed(false);
    setFinaleBackgroundReady(false);
    setScene("wish-lanterns");
    setSkyTransitioning(true);
    setLanternTransition("to-wishes");
  };

  const selectTrack = (index: number) => {
    if (!songs.length) return;
    const nextIndex = (index + songs.length) % songs.length;
    const nextSong = songs[nextIndex];
    if (!nextSong?.audioUrl) {
      setPlayerError("That song isn't available just now.");
      return;
    }
    setActiveIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
    setPlayerError("");
    // A track change is initiated by the visitor. If music is already playing,
    // continue with the selected track; otherwise selection never starts audio.
    if (isPlaying) playerRef.current?.playTrack(nextSong.audioUrl);
  };

  const stepTrack = (direction: -1 | 1) => {
    if (!songs.length) return;
    const next = activeIndex === null
      ? direction > 0 ? 0 : songs.length - 1
      : (activeIndex + direction + songs.length) % songs.length;
    selectTrack(next);
  };

  const togglePlayback = () => {
    if (!song) {
      setPlayerError(songsLoading ? "Still looking for your songs…" : songsError || "Pick a song first.");
      return;
    }
    if (isPlaying) playerRef.current?.pause();
    else playerRef.current?.playTrack(song.audioUrl);
  };

  const chooseLantern = (id: string) => {
    const choice = wishData.find((wish) => wish.id === id);
    if (!choice || releasedLanterns.has(id) || wishReleasing || selectedLantern !== null || lanternTransition !== "holding") return;
    if (closeNoteTimer.current) window.clearTimeout(closeNoteTimer.current);
    setSelectedLantern(id);
    setAffirmation(choice);
  };

  const revealFinalLanterns = () => {
    setFinalLanternsVisible(true);
    setFinalLanternsRevealed(false);
    setSelectedLantern(null);
    setAffirmation(null);
    setScene("wish-lanterns");
  };

  const holdFinalVideoFrame = () => {
    setFinalLanternsVisible(true);
    setSelectedLantern(null);
    setAffirmation(null);
    setScene("wish-lanterns");
    setSkyTransitioning(false);
    setLanternTransition("holding");
  };

  const finishReturnToAurora = () => {
    setSkyTransitioning(false);
    setLanternTransition("idle");
  };

  const returnToAuroraWorld = () => {
    if (scene !== "wish-lanterns" || lanternTransition !== "holding") return;
    closeNote(false);
    setFinalLanternsVisible(false);
    setFinalLanternsRevealed(false);
    setFinaleBackgroundReady(false);
    setScene("aurora-world");
    setLanternTransition("to-aurora");
    setSkyTransitioning(true);
  };

  const closeNote = (restoreFocus = true) => {
    const previousLantern = selectedLantern;
    setAffirmation(null);
    if (closeNoteTimer.current) window.clearTimeout(closeNoteTimer.current);
    closeNoteTimer.current = window.setTimeout(() => {
      setSelectedLantern(null);
      if (restoreFocus && scene === "wish-lanterns" && previousLantern !== null) {
        document.getElementById(`aurora-lantern-${previousLantern}`)?.focus();
      }
    }, reducedMotion ? 90 : 760);
  };

  const releaseWish = () => {
    const id = selectedLantern;
    if (!id || wishReleasing || releasedLanterns.has(id)) return;
    if (closeNoteTimer.current) window.clearTimeout(closeNoteTimer.current);
    setReleasedLanterns((previous) => new Set(previous).add(id));
    setWishReleasing(true);
    setAffirmation(null);
    const releasedAfterThisWish = new Set(releasedLanterns);
    releasedAfterThisWish.add(id);
    const nextWish = wishData.find((wish) => !releasedAfterThisWish.has(wish.id));
    releaseTimer.current = window.setTimeout(() => {
      setSelectedLantern(null);
      setWishReleasing(false);
      requestAnimationFrame(() => {
        const target = nextWish
          ? document.getElementById(`aurora-lantern-${nextWish.id}`)
          : document.querySelector<HTMLButtonElement>(".back-to-world");
        target?.focus();
      });
    }, reducedMotion ? 100 : 1550);
  };

  const toggleAmbient = async () => {
    const next = !ambientOn;
    if (next) {
      try {
        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        const context = audioContextRef.current || new AudioContextClass();
        audioContextRef.current = context;
        if (!ambienceGainRef.current) {
          const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
          const channel = buffer.getChannelData(0);
          let brown = 0;
          for (let i = 0; i < channel.length; i++) {
            brown = (brown + 0.025 * (Math.random() * 2 - 1)) / 1.025;
            channel[i] = brown * 3.5;
          }
          const source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
          const filter = context.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 460; filter.Q.value = 0.35;
          const gain = context.createGain(); gain.gain.value = 0;
          source.connect(filter); filter.connect(gain); gain.connect(context.destination); source.start(); ambienceGainRef.current = gain;
        }
        await context.resume();
        ambienceGainRef.current.gain.setTargetAtTime(0.024, context.currentTime, 0.8);
        setAmbientOn(true);
      } catch {
        setPlayerError("Couldn't start the wind just now.");
      }
    } else {
      const context = audioContextRef.current;
      if (context && ambienceGainRef.current) ambienceGainRef.current.gain.setTargetAtTime(0, context.currentTime, 0.25);
      setAmbientOn(false);
    }
  };

  const returnOpening = () => {
    closeNote(false);
    setLanternTransition("idle");
    setFinalLanternsVisible(false);
    setFinalLanternsRevealed(false);
    setFinaleBackgroundReady(false);
    setSkyTransitioning(false);
    setSelectedLantern(null);
    setAffirmation(null);
    setScene("intro");
  };

  const videoWishScene = scene === "wish-lanterns" && finalLanternsVisible;
  const resetReleasedWishes = () => {
    setReleasedLanterns(new Set());
    setSelectedLantern(null);
    setAffirmation(null);
    setWishReleasing(false);
  };

  return <main className={`aurora-world scene-${scene} ${reducedMotion ? "reduced-motion" : ""} ${skyTransitioning ? "sky-transitioning" : ""} ${videoWishScene ? "video-sky-ending" : ""} ${videoWishScene && lanternTransition === "holding" ? "video-sky-held" : ""}`} aria-busy={skyTransitioning || undefined}>
    <AuroraWorldVideo active={scene === "aurora-world" || scene === "cassette" || (scene === "wish-lanterns" && (lanternTransition === "to-wishes" || (lanternTransition === "holding" && !finaleBackgroundReady)))} reducedMotion={reducedMotion} onFrameReady={onAuroraWorldReady} onLoadError={onAuroraWorldLoadError}/>
    <CassetteMusicVideo active={scene === "cassette"} reducedMotion={reducedMotion}/>

    <header className="world-header">
      <Link href="/" className="world-mark" aria-label="Return to the AURORA opening scene" onClick={(event) => { event.preventDefault(); returnOpening(); }}><span className="mark-spark">✳</span><span>AURORA</span></Link>
      <div className="world-tools">
        {song ? <div className="persistent-music" aria-label={`Selected song: ${song.title}${song.artist ? ` by ${song.artist}` : ""}`}>
          <span className={`persistent-music-signal ${isPlaying ? "is-playing" : ""}`} aria-hidden="true"><AudioLines size={14}/></span>
          <span className="persistent-music-copy"><strong>{song.title}</strong><em>{song.artist || "Local collection"}</em></span>
          <button className="persistent-play" aria-label={isPlaying ? "Pause music" : "Play music"} onClick={togglePlayback}>{isPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}</button>
          {(scene === "aurora-world" || scene === "cassette") && <button className="persistent-open" aria-label={scene === "cassette" ? "Close the cassette player" : "Open the cassette playlist"} onClick={scene === "cassette" ? closeCassette : openCassette}><Headphones size={14}/></button>}
        </div> : scene === "aurora-world" && <button className="cassette-shortcut" onClick={openCassette} aria-label="Open the cassette and choose music"><Headphones size={14}/><span>Open cassette</span></button>}
        <button className={`sound-control ${ambientOn ? "sound-on" : ""}`} onClick={toggleAmbient} aria-label={ambientOn ? "Turn off quiet wind ambience" : "Turn on quiet wind ambience"} aria-pressed={ambientOn}><Wind size={15}/><span>{ambientOn ? "Wind on" : "Sound off"}</span></button>
        <button className="motion-control" onClick={() => setReducedMotion((value) => !value)} aria-label={reducedMotion ? "Use natural motion" : "Use reduced motion"} aria-pressed={reducedMotion}><span className="motion-dot"/>{reducedMotion ? "Still" : "Motion"}</button>
        {scene !== "intro" && <Link href="/admin" className="owner-link">Owner&apos;s desk</Link>}
      </div>
    </header>

    <AnimatePresence>
      {(scene === "intro" || (scene === "aurora-world" && !auroraWorldReady)) && <AuroraIntro key="intro" reducedMotion={reducedMotion} onEnter={enterAuroraWorld}/>}

      {scene === "aurora-world" && <motion.section key="aurora-world" className="aurora-world-chapter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: reducedMotion ? 0.05 : 0.28 } }} transition={{ duration: reducedMotion ? 0.15 : 0.85, delay: reducedMotion ? 0 : 1.6, ease: [0.2, 0.7, 0.2, 1] }} aria-label="The aurora world">
        <div className="world-choice-copy">
          <div className="world-choice-options" aria-label="Choose what to explore">
            <button className="world-choice-option" onClick={openCassette}><span className="world-choice-icon"><Music2 size={17}/></span><span className="world-choice-text"><strong>Songs vintava..?</strong><small>I&apos;ve got few of your favs.</small></span><ChevronRight size={16}/></button>
            <button className="world-choice-option" onClick={startWishChapter}><span className="world-choice-icon"><Sparkles size={17}/></span><span className="world-choice-text"><strong>Lanterns chudadaniki vasthava..?</strong><small>Some of those little lights have something for you.</small></span><ChevronRight size={16}/></button>
          </div>
        </div>
      </motion.section>}

      {scene === "cassette" && <motion.section key="cassette" className="cassette-experience" initial={{ opacity: 0, y: 16, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: reducedMotion ? 0.05 : 0.36 } }} transition={{ duration: reducedMotion ? 0.18 : 0.8, ease: [0.2, 0.7, 0.2, 1] }} aria-label="Music player">
        <div className="cassette-room">
          <header className="cassette-room-header">
            <div className="cassette-heading-copy"><h1>Em vindham..?</h1><p>Pick a song that feels right.</p></div>
            <button className="cassette-close" onClick={closeCassette}><span>Back to the aurora</span><X size={16}/></button>
          </header>
          <div className="cassette-room-grid">
            <section className="cassette-listening" aria-label="Now playing">
              <div className="cassette-now-playing"><span>{song && activeIndex !== null ? `NOW PLAYING · ${String(activeIndex + 1).padStart(2, "0")} / ${songs.length}` : "YOUR SONGS"}</span><strong>{song?.title || (songsLoading ? "Finding your songs…" : "Pick a song.")}</strong><em>{song?.artist || (song ? "From your music folder" : "Take your time.")}</em></div>
              <div className="cassette-video-space" aria-hidden="true"/>
              <div className="cassette-transport">
                <div className="transport-controls"><button aria-label="Previous track" disabled={!songs.length} onClick={() => stepTrack(-1)}><SkipBack size={16}/></button><button className="main-play" aria-label={isPlaying ? "Pause the current track" : "Play the selected track"} disabled={!song} onClick={togglePlayback}>{playerLoading ? <LoaderCircle className="spin" size={18}/> : isPlaying ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}</button><button aria-label="Next track" disabled={!songs.length} onClick={() => stepTrack(1)}><SkipForward size={16}/></button></div>
                <div className="seek-row"><span>{formatTime(currentTime)}</span><input aria-label="Track playback position" type="range" min={0} max={duration || 100} value={duration ? currentTime : 0} onChange={(event) => { const seconds = Number(event.target.value); setCurrentTime(seconds); playerRef.current?.seekTo(seconds); }} disabled={!duration}/><span>{formatTime(duration)}</span></div>
                <label className="volume-row"><VolumeX size={13}/><input aria-label="Cassette volume" type="range" min={0} max={100} value={volume} onChange={(event) => { const next = Number(event.target.value); setVolume(next); playerRef.current?.setVolume(next); }}/><Volume2 size={13}/></label>
                <div className="audio-caption"><span className="audio-caption-dot"/>{playerError ? <span role="status">{playerError}</span> : isPlaying ? "Playing from your song folder." : "Choose a song when you're ready."}</div>
              </div>
            </section>
            <aside className="playlist-panel"><div className="playlist-header"><div className="playlist-heading-copy"><strong>Hope its upto your taste..</strong><small>No rush. Find your favourite.</small></div><b>{songsLoading ? "…" : `${songs.length} songs`}</b></div><div className="playlist-scroll" role="group" aria-label="Your songs">
              {songs.map((item, index) => <button key={item.id} className={`playlist-track has-track ${index === activeIndex ? "track-active" : ""}`} onClick={() => selectTrack(index)} aria-pressed={index === activeIndex}><span className="track-no">{index === activeIndex && isPlaying ? <AudioLines size={13}/> : String(index + 1).padStart(2, "0")}</span><span className="playlist-name"><strong>{item.title}</strong>{item.artist && <em>{item.artist}</em>}</span><span className="track-action">{index === activeIndex && isPlaying ? <AudioLines size={14}/> : <Play size={13}/>}</span></button>)}
              {songsLoading && <p className="playlist-message"><LoaderCircle className="spin" size={15}/> Looking through your songs…</p>}
              {!songsLoading && songsError && <p className="playlist-message" role="alert">{songsError}</p>}
              {!songsLoading && !songsError && !songs.length && <p className="playlist-message">No songs in the folder yet.</p>}
            </div></aside>
          </div>
        </div>
      </motion.section>}

      {scene === "wish-lanterns" && <motion.section key="wish-lanterns" className="lantern-experience" initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: { duration: reducedMotion ? 0.05 : 0.36 } }} transition={{ duration: reducedMotion ? 0.18 : 0.95, ease: [0.2, 0.7, 0.2, 1] }} aria-label="Wish lanterns">
        <button className="back-to-world" onClick={returnToAuroraWorld}><Home size={14}/> Return to Aurora</button>
      </motion.section>}
    </AnimatePresence>

    <LanternTransitionVideo phase={lanternTransition} reducedMotion={reducedMotion} finaleVisible={videoWishScene} returnReady={auroraWorldReady} onFinalLanterns={revealFinalLanterns} onHold={holdFinalVideoFrame} onReturnComplete={finishReturnToAurora}/>
    {scene === "wish-lanterns" && lanternTransition !== "idle" && <FinaleVideoBackground active={videoWishScene && lanternTransition === "holding"} reducedMotion={reducedMotion} onReady={onFinaleBackgroundReady}/>}
    {videoWishScene && lanternTransition === "holding" && <BirthdayFinaleOverlay reducedMotion={reducedMotion} backgroundReady={finaleBackgroundReady} releasedLanternIds={releasedLanterns} wishReleasing={wishReleasing} onLanternsReveal={() => setFinalLanternsRevealed(true)} onSeeWishesAgain={resetReleasedWishes}>
      <LanternField active={false} videoFinale finaleRevealed={finalLanternsRevealed} videoSelectable={finalLanternsRevealed} selectedId={selectedLantern} releasedIds={releasedLanterns} releasing={wishReleasing || (selectedLantern !== null && affirmation === null && !skyTransitioning)} reducedMotion={reducedMotion} onSelect={chooseLantern}/>
    </BirthdayFinaleOverlay>}

    {/* One audio element stays mounted above every scene. Scene transitions never reset its source or time. */}
    <AudioPlayer ref={playerRef} volume={volume} onPlaying={onPlayerPlaying} onProgress={onPlayerProgress} onReady={onPlayerReady} onLoading={onPlayerLoading} onError={onPlayerError} onEnded={onPlayerEnded}/>

    {affirmation && scene === "wish-lanterns" && <div className="note-dim" aria-hidden="true"/>}
    <AnimatePresence custom={wishReleasing}>{affirmation && scene === "wish-lanterns" && <AffirmationNote affirmation={affirmation} onClose={closeNote} onRelease={releaseWish} releasing={wishReleasing} reducedMotion={reducedMotion}/>}</AnimatePresence>

    {scene !== "intro" && <footer className="world-footer"><span>No rush.</span><span className="footer-center">✦</span><span>Stay as long as you like.</span></footer>}
  </main>;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
