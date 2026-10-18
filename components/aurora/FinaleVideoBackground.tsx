"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/gemini_generated_video_45cb988e.mp4";

type Props = {
  active: boolean;
  reducedMotion: boolean;
  onReady: (isPlaying: boolean) => void;
};

export function FinaleVideoBackground({
  active,
  reducedMotion,
  onReady,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onReadyRef = useRef(onReady);
  const [hasFrame, setHasFrame] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  const startVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !active || reducedMotion) return;

    try {
      video.muted = true;
      await video.play();
      setPlaybackBlocked(false);
    } catch {
      setPlaybackBlocked(true);
      onReadyRef.current(false);
    }
  }, [active, reducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!active || reducedMotion) {
      video.pause();
      if (!active) onReadyRef.current(false);
      return;
    }

    let cancelled = false;
    video.muted = true;
    void video.play().then(() => {
      if (!cancelled) setPlaybackBlocked(false);
    }).catch(() => {
      if (cancelled) return;
      setPlaybackBlocked(true);
      onReadyRef.current(false);
    });

    return () => {
      cancelled = true;
      video.pause();
    };
  }, [active, reducedMotion]);

  const handlePlaying = () => {
    setPlaybackBlocked(false);
    onReadyRef.current(true);
  };

  const handleError = () => {
    setPlaybackBlocked(true);
    onReadyRef.current(false);
  };

  return (
    <div
      className={`finale-video-background ${
        active ? "is-visible" : ""
      } ${reducedMotion ? "is-reduced" : ""}`}
    >
      <video
        ref={videoRef}
        className={`finale-loop-video ${hasFrame ? "is-visible" : ""}`}
        src={VIDEO_SRC}
        autoPlay={active && !reducedMotion}
        muted
        playsInline
        loop
        preload="auto"
        aria-hidden="true"
        onLoadedData={() => { setHasFrame(true); onReadyRef.current(true); }}
        onPlaying={handlePlaying}
        onError={handleError}
      />

      {playbackBlocked && active && !reducedMotion && (
        <button
          className="finale-video-retry"
          type="button"
          onClick={() => void startVideo()}
        >
          Try the moving aurora
        </button>
      )}
    </div>
  );
}
