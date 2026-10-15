"use client";

import { useEffect, useRef, useState } from "react";

export function CabinSceneVideo({ reducedMotion = false, paused = false }: { reducedMotion?: boolean; paused?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion || paused) {
      video.pause();
      return;
    }
    void video.play().then(() => setFailed(false)).catch(() => setFailed(true));
  }, [reducedMotion, paused]);

  return <div className={`cabin-video-layer ${failed ? "is-failed" : ""}`} aria-hidden="true">
    <video ref={videoRef} className="cabin-scene-video" autoPlay muted playsInline loop preload="auto"
      onCanPlay={() => setFailed(false)} onError={() => setFailed(true)}>
      <source src="/gemini_generated_video_d86f5b64.mp4" type="video/mp4"/>
    </video>
    {failed && <span className="sr-only" role="status">Cabin film unavailable. Showing the existing Arctic scene image instead.</span>}
  </div>;
}
