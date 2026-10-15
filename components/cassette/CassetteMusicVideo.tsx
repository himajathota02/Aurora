"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";

type Props = { active: boolean; reducedMotion: boolean };

/** A single muted foreground film that pauses with the player and keeps its frame. */
export function CassetteMusicVideo({ active, reducedMotion }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasFrame, setHasFrame] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active || reducedMotion || failure) {
      video.pause();
      return;
    }

    let cancelled = false;
    // Loop the decorative cassette film for the whole time the player is open.
    // In particular, don't leave a finished frame behind when the player reopens.
    video.loop = true;
    if (video.ended) video.currentTime = 0;
    void video.play()
      .then(() => { if (!cancelled) setBlocked(false); })
      .catch((error: unknown) => {
        if (cancelled) return;
        const reason = error instanceof Error ? error : new Error(String(error));
        if (reason.name === "NotAllowedError") {
          setBlocked(true);
          return;
        }
        console.warn("[AURORA] Cassette film playback failed", reason);
        setFailure("The little film couldn't start, but the songs are still here.");
      });
    return () => {
      cancelled = true;
      video.pause();
    };
  }, [active, reducedMotion, failure]);

  const retry = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.ended) video.currentTime = 0;
    void video.play().then(() => setBlocked(false)).catch((error: unknown) => {
      const reason = error instanceof Error ? error : new Error(String(error));
      console.warn("[AURORA] Cassette film retry failed", reason);
      setBlocked(reason.name === "NotAllowedError");
      if (reason.name !== "NotAllowedError") setFailure("The little film couldn't start, but the songs are still here.");
    });
  };

  const handleMediaError = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    const mediaError = video.error;
    const message = mediaError
      ? `Cassette film media error ${mediaError.code}${mediaError.message ? `: ${mediaError.message}` : ""}`
      : "Cassette film media error";
    console.error("[AURORA] Cassette film could not be decoded or loaded", {
      message,
      source: video.currentSrc || video.querySelector("source")?.src,
      networkState: video.networkState,
      readyState: video.readyState,
    });
    setFailure("The little film couldn't load, but the songs are still here.");
    setBlocked(false);
  };

  return <div className={`cassette-film-layer ${active ? "is-active" : ""} ${failure ? "is-failed" : ""}`} aria-hidden={!active || (!blocked && !failure)}>
    <div className="cassette-film-frame">
      {!failure && <video ref={videoRef} aria-hidden="true" className={hasFrame ? "has-frame" : ""} muted playsInline loop={!reducedMotion} preload={active ? "auto" : "metadata"} disablePictureInPicture
        onLoadedData={() => setHasFrame(true)} onPlaying={() => { setHasFrame(true); setBlocked(false); }} onError={handleMediaError}>
        <source src="/gemini_generated_video_2867cff1.mp4" type="video/mp4"/>
      </video>}
      {blocked && active && !reducedMotion && <button className="cassette-film-retry" onClick={retry}>Play the little film</button>}
      {failure && active && <p className="cassette-film-error" role="status">{failure}</p>}
    </div>
  </div>;
}
