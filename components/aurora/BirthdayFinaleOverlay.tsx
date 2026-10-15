"use client";

import { useEffect, useRef, useState } from "react";
import { AuroraCanvas } from "./AuroraCanvas";

type Props = {
  reducedMotion: boolean;
  onLanternsReveal: () => void;
  onLanternsReady: () => void;
};

/** Adds a slow sky-only aurora and stages the birthday copy around the lantern reveal. */
export function BirthdayFinaleOverlay({ reducedMotion, onLanternsReveal, onLanternsReady }: Props) {
  const [dedicationVisible, setDedicationVisible] = useState(false);
  const revealRef = useRef(onLanternsReveal);
  const readyRef = useRef(onLanternsReady);

  useEffect(() => { revealRef.current = onLanternsReveal; readyRef.current = onLanternsReady; }, [onLanternsReveal, onLanternsReady]);

  useEffect(() => {
    const revealTimer = window.setTimeout(() => revealRef.current(), reducedMotion ? 60 : 1600);
    const readyTimer = window.setTimeout(() => {
      setDedicationVisible(true);
      readyRef.current();
    }, reducedMotion ? 150 : 4200);
    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(readyTimer);
    };
  }, [reducedMotion]);

  return <div className={`birthday-finale ${reducedMotion ? "is-reduced" : ""}`}>
    <div className="birthday-aurora-sky"><AuroraCanvas reducedMotion={reducedMotion}/></div>
    <p className="birthday-finale-heading">
      <span className="birthday-heading-star" aria-hidden="true">✧</span>
      <span className="birthday-heading-copy" data-text="22 little wishes, just for your 23rd birthday">22 Little wishes for your Birthday !</span>
      <span className="birthday-heading-star" aria-hidden="true">✧</span>
    </p>
    {dedicationVisible && <p className="birthday-finale-dedication">
      <span className="birthday-particle birthday-particle-left" aria-hidden="true">✦</span>
      <span className="birthday-dedication-copy" data-text="Happy Birthday, Chinnuuuu ♡">Happy Birthday!! Chinnuuuu </span><span>🫀</span>
      <span className="birthday-particle birthday-particle-right" aria-hidden="true">✦</span>
    </p>}
  </div>;
}
