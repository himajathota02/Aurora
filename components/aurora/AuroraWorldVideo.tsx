"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  active: boolean;
  reducedMotion: boolean;
  onFrameReady: () => void;
  onLoadError: () => void;
};

/** The second-scene film persists behind the music player. */
export function AuroraWorldVideo({ active, reducedMotion, onFrameReady, onLoadError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);
  const frameReadyRef = useRef(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const markFrameReady = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || frameReadyRef.current) return;
    frameReadyRef.current = true;
    setHasFrame(true);
    onFrameReady();
  }, [onFrameReady]);

  const resetLoadingCycle = () => {
    frameReadyRef.current = false;
    setHasFrame(false);
    setFailed(false);
  };

  const handleError = () => {
    setFailed(true);
    setBlocked(false);
    onLoadError();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active || failed) {
      video.pause();
      return;
    }
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) markFrameReady();
    if (reducedMotion) {
      const holdLastFrame = () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        video.currentTime = Math.max(0, video.duration - 0.06);
        video.pause();
      };
      if (video.readyState >= 1) holdLastFrame();
      else video.addEventListener("loadedmetadata", holdLastFrame, { once: true });
      return () => video.removeEventListener("loadedmetadata", holdLastFrame);
    }
    if (!startedRef.current) {
      video.currentTime = 0;
      startedRef.current = true;
    }
    void video.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
    return () => video.pause();
  }, [active, failed, markFrameReady, reducedMotion]);

  const retry = () => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
  };

  return <div className={`aurora-world-video ${active ? "is-active" : ""} ${hasFrame ? "has-frame" : ""} ${failed ? "is-failed" : ""}`} aria-hidden={!active}>
    {!failed && <video ref={videoRef} muted playsInline loop preload="auto" onLoadStart={resetLoadingCycle} onLoadedData={markFrameReady} onCanPlay={markFrameReady} onError={handleError}>
      <source src="/gemini_generated_video_41e33c0c.mp4" type="video/mp4"/>
    </video>}
    {blocked && active && <button className="world-video-retry" onClick={retry}>Start the video</button>}
  </div>;
}
