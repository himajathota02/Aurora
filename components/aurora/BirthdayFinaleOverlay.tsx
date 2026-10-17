"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BoyCharacter } from "./BoyCharacter";

type Props = {
  reducedMotion: boolean;
  backgroundReady: boolean;
  allWishesReleased: boolean;
  onLanternsReveal: () => void;
  onLanternsReady: () => void;
  onSeeWishesAgain: () => void;
};

/** Stages the boy, birthday copy, and quiet ending over the moving finale film. */
export function BirthdayFinaleOverlay({ reducedMotion, backgroundReady, allWishesReleased, onLanternsReveal, onLanternsReady, onSeeWishesAgain }: Props) {
  const [boyVisible, setBoyVisible] = useState(false);
  const [headingVisible, setHeadingVisible] = useState(false);
  const [dedicationVisible, setDedicationVisible] = useState(false);
  const [endingMinimized, setEndingMinimized] = useState(false);
  const revealRef = useRef(onLanternsReveal);
  const readyRef = useRef(onLanternsReady);
  const dedicationTimer = useRef<number | null>(null);
  const arrivalTimer = useRef<number | null>(null);
  const arrivedRef = useRef(false);

  useEffect(() => { revealRef.current = onLanternsReveal; readyRef.current = onLanternsReady; }, [onLanternsReveal, onLanternsReady]);

  useEffect(() => {
  if (!backgroundReady) return;

  const revealTimer = window.setTimeout(() => {
    revealRef.current();
    setHeadingVisible(true);
  }, reducedMotion ? 0 : 400);

  const boyTimer = window.setTimeout(
    () => setBoyVisible(true),
    reducedMotion ? 0 : 1650
  );

  return () => {
    window.clearTimeout(revealTimer);
    window.clearTimeout(boyTimer);

    if (dedicationTimer.current !== null) {
      window.clearTimeout(dedicationTimer.current);
    }

    if (arrivalTimer.current !== null) {
      window.clearTimeout(arrivalTimer.current);
    }
  };
}, [backgroundReady, reducedMotion]);

  const onBoyArrive = useCallback(() => {
    if (arrivedRef.current) return;
    arrivedRef.current = true;
    if (arrivalTimer.current !== null) window.clearTimeout(arrivalTimer.current);
    setHeadingVisible(true);
    dedicationTimer.current = window.setTimeout(() => {
      setDedicationVisible(true);
      readyRef.current();
    }, reducedMotion ? 80 : 850);
  }, [reducedMotion]);

  useEffect(() => {
    if (!boyVisible || reducedMotion) return;
    // Keep the staged reveal moving if a browser drops the renderer's final RAF callback.
    arrivalTimer.current = window.setTimeout(onBoyArrive, 6200);
    return () => { if (arrivalTimer.current !== null) window.clearTimeout(arrivalTimer.current); };
  }, [boyVisible, onBoyArrive, reducedMotion]);

  return <div className={`birthday-finale ${reducedMotion ? "is-reduced" : ""}`}>
    {boyVisible && <BoyCharacter className="birthday-boy-character" reducedMotion={reducedMotion} onArrive={onBoyArrive}/>}
    {headingVisible && (
  <p className="birthday-finale-heading">
    <span className="birthday-heading-star" aria-hidden="true">
      ✧
    </span>

    <span
      className="birthday-heading-copy"
      data-text="22 Little Things I Hope for You but I Never Say Out Loud"
    >
      22 Little Things I Hope for You but I Never Say Out Loud
    </span>

    <span className="birthday-heading-star" aria-hidden="true">
      ✧
    </span>
  </p>
)}
    {dedicationVisible && (
  <p className="birthday-finale-dedication">
      <span className="birthday-particle birthday-particle-left" aria-hidden="true">✦</span>
      <span className="birthday-dedication-copy" data-text="Happy Birthday!!">Happy Birthday!!</span>
      <span className="birthday-dedication-name">Chinnuuuu 🫀</span>
      <span className="birthday-particle birthday-particle-right" aria-hidden="true">✦</span>
    </p>)}
    
{allWishesReleased && (
  <section
    className={`birthday-closing ${endingMinimized ? "is-minimized" : ""}`}
    aria-live="polite"
    aria-label="A note to close the night"
  >
    <div className="birthday-closing-copy">
  <p>
    If I could give you only one wish, it would be that you never feel alone.
  </p>

  <p>
   Because you’re not. I’m always here.
  </p>

  <p>
    Whether it's a good day , bad day or at night 2am, I’ll be here. 
  </p>

  <p>
    I’d rather hear your messy feelings than another “Baney Unnaa...”
  </p>
<p> 
  Hope this year is filled with lot more new place and experiences,
</p>
  <p>
    And..If you ever forget how loved you are, come back and read this.
  </p>

  <p className="birthday-closing-signoff">
    Happy 22, Chinnu 🫀. I’m so glad you exist.
  </p>
  <div className="birthday-closing-controls">
      <button
        type="button"
        onClick={() => setEndingMinimized((value) => !value)}
      >
        {endingMinimized ? "Read the closing note" : "Stay a little longer"}
      </button>

      <button
        type="button"
        onClick={() => {
          setEndingMinimized(false);
          onSeeWishesAgain();
        }}
      >
        See the wishes again
      </button>
    </div>
</div>

    
  </section>
)}

  </div>;
}
