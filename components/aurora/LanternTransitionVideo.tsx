"use client";

import { useEffect, useRef, useState } from "react";

export type LanternVideoPhase = "idle" | "to-wishes" | "holding" | "to-aurora";
type Props = {
  phase: LanternVideoPhase;
  reducedMotion: boolean;
  finaleVisible: boolean;
  onFinalLanterns: () => void;
  onHold: () => void;
  onReturnComplete: () => void;
};

/** Plays the wish-sky film once, then keeps its last frame beneath the interactive lanterns. */
export function LanternTransitionVideo({ phase, reducedMotion, finaleVisible, onFinalLanterns, onHold, onReturnComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const finalRef = useRef(onFinalLanterns);
  const holdRef = useRef(onHold);
  const returnRef = useRef(onReturnComplete);
  const [videoFailed, setVideoFailed] = useState(false);
  const [returnFading, setReturnFading] = useState(false);
  useEffect(() => { finalRef.current = onFinalLanterns; holdRef.current = onHold; returnRef.current = onReturnComplete; }, [onFinalLanterns, onHold, onReturnComplete]);

  useEffect(() => {
    if (phase === "idle") return;
    const video = videoRef.current;
    if (!video) return;
    if (phase === "holding") { video.pause(); return; }

    let cancelled = false;
    let finalShown = false;
    let ended = false;
    let reducedFallback = 0;
    let finishTimer = 0;
    const showFinal = () => {
      if (cancelled || finalShown) return;
      finalShown = true;
      finalRef.current();
    };
    const holdFinal = () => {
      if (cancelled || ended) return;
      ended = true;
      showFinal();
      video.pause();
      holdRef.current();
    };
    const finishReturn = () => {
      if (cancelled || ended) return;
      ended = true;
      video.pause();
      setReturnFading(true);
      finishTimer = window.setTimeout(() => returnRef.current(), reducedMotion ? 130 : 550);
    };
    const failed = () => {
      if (cancelled) return;
      setVideoFailed(true);
      if (phase === "to-wishes") holdFinal();
      else finishReturn();
    };
    const onEnded = () => phase === "to-wishes" ? holdFinal() : finishReturn();

    video.addEventListener("error", failed);
    video.addEventListener("ended", onEnded);
    if (videoFailed) {
      if (phase === "to-wishes") holdFinal();
      else finishReturn();
    } else if (phase === "to-aurora") {
      // Reuse the held frame briefly while the background film resumes underneath.
      video.pause();
      finishTimer = window.setTimeout(finishReturn, reducedMotion ? 100 : 300);
    } else if (reducedMotion) {
      if (phase === "to-wishes") {
        const seekToEnd = () => {
          if (cancelled) return;
          if (!Number.isFinite(video.duration) || video.duration <= 0) { holdFinal(); return; }
          const onSeeked = () => holdFinal();
          video.addEventListener("seeked", onSeeked, { once: true });
          video.currentTime = Math.max(0, video.duration - 0.06);
          reducedFallback = window.setTimeout(holdFinal, 550);
        };
        if (video.readyState >= 1) seekToEnd();
        else video.addEventListener("loadedmetadata", seekToEnd, { once: true });
      } else finishReturn();
    } else {
      video.currentTime = 0;
      void video.play().catch(failed);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(reducedFallback);
      window.clearTimeout(finishTimer);
      video.removeEventListener("error", failed);
      video.removeEventListener("ended", onEnded);
      video.pause();
    };
  }, [phase, reducedMotion, videoFailed]);

  if (phase === "idle") return null;
  return <div className={`lantern-transition-video phase-${phase} ${finaleVisible ? "has-finale" : ""} ${videoFailed ? "is-video-failed" : ""} ${returnFading ? "is-return-fading" : ""}`} aria-hidden="true">
    {!videoFailed && <video ref={videoRef} muted playsInline preload="auto" poster="/aurora-arctic.jpg">
      <source src="/gemini_generated_video_17d2f205.mp4" type="video/mp4"/>
    </video>}
    <span className="lantern-transition-shade"/>
  </div>;
}
