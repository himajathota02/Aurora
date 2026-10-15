"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type AudioPlayerController = {
  playTrack: (url: string) => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
};

type Props = {
  volume: number;
  onPlaying: (playing: boolean) => void;
  onProgress: (currentTime: number, duration: number) => void;
  onReady: () => void;
  onLoading: () => void;
  onError: (message: string) => void;
  onEnded: () => void;
};

export const AudioPlayer = forwardRef<AudioPlayerController, Props>(function AudioPlayer({ volume, onPlaying, onProgress, onReady, onLoading, onError, onEnded }, ref) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const callbacks = useRef({ onPlaying, onProgress, onReady, onLoading, onError, onEnded });

  useEffect(() => { callbacks.current = { onPlaying, onProgress, onReady, onLoading, onError, onEnded }; }, [onPlaying, onProgress, onReady, onLoading, onError, onEnded]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
  }, [volume]);

  useImperativeHandle(ref, () => ({
    playTrack(url) {
      const audio = audioRef.current;
      if (!audio || !url) return;
      if (audio.getAttribute("src") !== url) {
        callbacks.current.onLoading();
        audio.src = url;
        audio.load();
      } else if (audio.ended) {
        audio.currentTime = 0;
      }
      void audio.play().catch((error: unknown) => {
        const message = error instanceof DOMException && error.name === "NotAllowedError"
          ? "Tap play to begin this track."
          : "This local audio file could not be played. Check the file format and connection.";
        callbacks.current.onPlaying(false);
        callbacks.current.onError(message);
      });
    },
    pause() { audioRef.current?.pause(); },
    setVolume(volume) { if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, volume / 100)); },
    seekTo(time) {
      const audio = audioRef.current;
      if (audio && Number.isFinite(audio.duration)) audio.currentTime = Math.max(0, Math.min(audio.duration, time));
    },
  }), []);

  useEffect(() => () => {
    const audio = audioRef.current;
    audio?.pause();
    audio?.removeAttribute("src");
    audio?.load();
  }, []);

  return <audio
    ref={audioRef}
    className="aurora-audio"
    preload="metadata"
    aria-label="Cassette audio player"
    onLoadStart={() => { callbacks.current.onLoading(); callbacks.current.onPlaying(false); }}
    onCanPlay={() => callbacks.current.onReady()}
    onPlaying={() => callbacks.current.onPlaying(true)}
    onPause={() => callbacks.current.onPlaying(false)}
    onWaiting={() => callbacks.current.onPlaying(false)}
    onEnded={() => { callbacks.current.onPlaying(false); callbacks.current.onProgress(audioRef.current?.duration || 0, audioRef.current?.duration || 0); callbacks.current.onEnded(); }}
    onTimeUpdate={() => callbacks.current.onProgress(audioRef.current?.currentTime || 0, audioRef.current?.duration || 0)}
    onDurationChange={() => callbacks.current.onProgress(audioRef.current?.currentTime || 0, audioRef.current?.duration || 0)}
    onError={() => { callbacks.current.onPlaying(false); callbacks.current.onError("This local audio file could not be loaded. Check the file format and the Songs folder."); }}
  />;
});
