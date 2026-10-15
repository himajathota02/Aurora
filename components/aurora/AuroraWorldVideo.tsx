"use client";

import { useEffect, useRef, useState } from "react";

type Props = { active: boolean; reducedMotion: boolean };

/** The second-scene film persists behind the music player. */
export function AuroraWorldVideo({ active, reducedMotion }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active || failed) {
      video.pause();
      return;
    }
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
  }, [active, failed, reducedMotion]);

  const retry = () => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
  };

  return <div className={`aurora-world-video ${active ? "is-active" : ""} ${failed ? "is-failed" : ""}`} aria-hidden={!active}>
    {!failed && <video ref={videoRef} muted playsInline loop preload="auto" poster="/aurora-arctic.jpg" onError={() => { setFailed(true); setBlocked(false); }}>
      <source src="/gemini_generated_video_41e33c0c.mp4" type="video/mp4"/>
    </video>}
    {blocked && active && <button className="world-video-retry" onClick={retry}>Start the video</button>}
  </div>;
}
