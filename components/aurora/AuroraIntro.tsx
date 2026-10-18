"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BoyCharacter } from "./BoyCharacter";

type Props = { reducedMotion: boolean; onEnter: () => void };

export function AuroraIntro({ reducedMotion, onEnter }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [dialogueStage, setDialogueStage] = useState(0);
  const visibleDialogueStage = arrived && reducedMotion ? 3 : dialogueStage;

  useEffect(() => {
    if (!arrived || reducedMotion) return;
    const timers = [
      window.setTimeout(() => setDialogueStage(1), 750),
      window.setTimeout(() => setDialogueStage(2), 2_250),
      window.setTimeout(() => setDialogueStage(3), 4_350),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [arrived, reducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
      return;
    }
    video.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true));
  }, [reducedMotion]);

  const startVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true));
  };

  return <motion.section className="aurora-intro" aria-labelledby="aurora-greeting"
    initial={{ opacity: 0, scale: reducedMotion ? 1 : 1.015 }} animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: reducedMotion ? 1 : 1.045, transition: { duration: reducedMotion ? 0.08 : 0.8, ease: [0.72, 0, 0.28, 1] } }}
    transition={{ duration: reducedMotion ? 0.12 : 1.15, ease: [0.2, 0.75, 0.2, 1] }}>
    <video ref={videoRef} className={`aurora-intro-video ${videoReady ? "has-frame" : ""}`} autoPlay muted playsInline loop preload="auto" aria-hidden="true"
      onLoadedData={() => { setVideoReady(true); setVideoError(false); }} onCanPlay={() => { setVideoReady(true); setVideoError(false); }} onError={() => { setVideoError(true); setAutoplayBlocked(false); }}>
      <source src="/assets/aurora-bg.mp4" type="video/mp4"/>
    </video>
    <div className="aurora-intro-shade" aria-hidden="true"/>
    <BoyCharacter reducedMotion={reducedMotion} onArrive={() => setArrived(true)}/>

    <motion.div className={`intro-copy ${arrived ? "intro-copy-arrived" : ""}`} initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }} animate={arrived ? { opacity: 1, y: 0 } : { opacity: 0, y: reducedMotion ? 0 : 18 }} transition={{ duration: reducedMotion ? 0.15 : 1.2, delay: reducedMotion ? 0 : 0.16 }}>
      {/* <p className="intro-eyebrow"><span/>A Sky full of hopes</p> */}
      <div className="intro-dialogue" aria-live="polite" aria-atomic="true">
        <AnimatePresence initial={false}>
          {visibleDialogueStage >= 1 && <motion.h1 key="hello" id="aurora-greeting" className="intro-dialogue-line intro-dialogue-first" initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: reducedMotion ? 0 : 0.75, ease: [0.2, 0.7, 0.2, 1] }} > Hello Masteruu...  !</motion.h1>}
          {visibleDialogueStage >= 2 && <motion.p key="invitation" className="intro-subtitle intro-dialogue-line" initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.85, ease: [0.2, 0.7, 0.2, 1] }}>Ela unnaru...?! Padhandi budget friendly ga northen lights cover cheddam..</motion.p>}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {visibleDialogueStage >= 3 && <motion.button className="intro-enter" onClick={onEnter} initial={{ opacity: 0, y: reducedMotion ? 0 : 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.2, 0.7, 0.2, 1] }}>Come with me</motion.button>}
      </AnimatePresence>
      {videoError && <p className="asset-status" role="status">The aurora video didn&apos;t load.</p>}
      {autoplayBlocked && !videoError && <button className="video-retry" onClick={startVideo}>Try the aurora again</button>}
    </motion.div>
  </motion.section>;
}
