"use client";

import { useEffect, useRef, useState } from "react";

export type LanternVideoPhase = "idle" | "to-wishes" | "holding" | "to-aurora";
type Props = {
  phase: LanternVideoPhase;
  reducedMotion: boolean;
  finaleVisible: boolean;
  returnReady: boolean;
  onFinalLanterns: () => void;
  onHold: () => void;
  onReturnComplete: () => void;
};

/** Plays the wish-sky film once, then keeps its last frame beneath the interactive lanterns. */
export function LanternTransitionVideo({ phase, reducedMotion, finaleVisible, returnReady, onFinalLanterns, onHold, onReturnComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const finalRef = useRef(onFinalLanterns);
  const holdRef = useRef(onHold);
  const returnRef = useRef(onReturnComplete);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
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
    let cutoffTimer = 0;
    let reducedMetadataListener: (() => void) | null = null;
    let reducedSeekListener: (() => void) | null = null;
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
      finishTimer = window.setTimeout(() => returnRef.current(), reducedMotion ? 20 : 550);
    };
    const failed = () => {
      if (cancelled) return;
      setVideoFailed(true);
      if (phase === "to-wishes") holdFinal();
      else if (returnReady) finishReturn();
    };
    const onEnded = () => {
      if (phase === "to-wishes") holdFinal();
      else if (returnReady) finishReturn();
    };
    const cutoffWishVideo = () => {
      if (cancelled || phase !== "to-wishes") return;
      const cutoff = Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(6.5, Math.max(0, video.duration - 0.06))
        : 6.5;
      if (video.currentTime >= cutoff) holdFinal();
    };
    const armWishCutoff = () => {
      if (cancelled || phase !== "to-wishes" || reducedMotion) return;
      window.clearTimeout(cutoffTimer);
      const cutoff = Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(6.5, Math.max(0, video.duration - 0.06))
        : 6.5;
      const remaining = Math.max(0, cutoff - video.currentTime);
      cutoffTimer = window.setTimeout(() => {
        if (video.currentTime >= cutoff || video.ended) holdFinal();
      }, remaining * 1000 + 350);
    };

    video.addEventListener("error", failed);
    video.addEventListener("ended", onEnded);
    video.addEventListener("timeupdate", cutoffWishVideo);
    video.addEventListener("loadedmetadata", armWishCutoff);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) setVideoReady(true);
    if (phase === "to-aurora") {
      video.pause();
      if (returnReady || videoFailed) finishReturn();
    } else if (videoFailed) {
      holdFinal();
    } else if (reducedMotion) {
      if (phase === "to-wishes") {
        const seekToEnd = () => {
          if (cancelled) return;
          if (!Number.isFinite(video.duration) || video.duration <= 0) { holdFinal(); return; }
          reducedSeekListener = () => holdFinal();
          video.addEventListener("seeked", reducedSeekListener, { once: true });
          video.currentTime = Math.max(0, video.duration - 0.06);
          reducedFallback = window.setTimeout(holdFinal, 550);
        };
        if (video.readyState >= 1) seekToEnd();
        else {
          reducedMetadataListener = seekToEnd;
          video.addEventListener("loadedmetadata", reducedMetadataListener, { once: true });
        }
      } else finishReturn();
    } else {
      video.currentTime = 0;
      if (phase === "to-wishes") armWishCutoff();
      void video.play().catch(failed);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(reducedFallback);
      window.clearTimeout(finishTimer);
      window.clearTimeout(cutoffTimer);
      video.removeEventListener("error", failed);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("timeupdate", cutoffWishVideo);
      video.removeEventListener("loadedmetadata", armWishCutoff);
      if (reducedMetadataListener) video.removeEventListener("loadedmetadata", reducedMetadataListener);
      if (reducedSeekListener) video.removeEventListener("seeked", reducedSeekListener);
      video.pause();
    };
  }, [phase, reducedMotion, videoFailed, returnReady]);

  if (phase === "idle") return null;
  return <div className={`lantern-transition-video phase-${phase} ${finaleVisible ? "has-finale" : ""} ${videoFailed ? "is-video-failed" : ""} ${videoReady || videoFailed ? "is-ready" : ""} ${returnFading ? "is-return-fading" : ""}`} aria-hidden="true">
    {!videoFailed && <video ref={videoRef} muted playsInline preload="auto" onLoadedData={() => setVideoReady(true)} onCanPlay={() => setVideoReady(true)} onPlaying={() => setVideoReady(true)}>
      <source src="/gemini_generated_video_17d2f205.mp4" type="video/mp4"/>
    </video>}
    <span className="lantern-transition-shade"/>
  </div>;
}
