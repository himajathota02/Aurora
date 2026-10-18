"use client";

import { animate, motion, useMotionValue, usePresence, useTransform } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Affirmation } from "../../types/content";

type Props = { affirmation: Affirmation; onClose: () => void; onRelease: () => void; releasing?: boolean; reducedMotion?: boolean };

/** Same 23 points in both shapes, so the clip-path can morph between a crumpled ball and the torn sheet. */
const TORN = "polygon(.7% .5%,12% .9%,25% .4%,40% .8%,56% .4%,72% .7%,87% .3%,99.3% .8%,99.7% 18%,99.2% 40%,99.7% 62%,99.1% 82%,99.5% 99.2%,83% 99.5%,67% 99.1%,49% 99.6%,31% 99.2%,14% 99.7%,.6% 99.2%,.9% 82%,.4% 64%,.8% 43%,.3% 21%)";
const BALL = "polygon(38% 30%,43% 27%,48% 31%,53% 26%,58% 30%,63% 27%,67% 32%,70% 36%,66% 41%,71% 47%,67% 54%,70% 60%,65% 66%,61% 71%,56% 67%,51% 73%,46% 68%,41% 72%,36% 66%,33% 60%,37% 55%,32% 48%,36% 40%)";

const CRUMPLE_IN: [number, number, number, number] = [0.5, 0, 0.8, 0.45];
const UNFOLD: [number, number, number, number] = [0.22, 0.82, 0.25, 1];
const FLY: [number, number, number, number] = [0.25, 0.6, 0.35, 1];
const MAX_WARP = 64; // how strongly the paper is warped while crumpled (SVG displacement, in px)

let noteCounter = 0;
const smart = (t: string) => t.replace(/'/g, "\u2019");

export function AffirmationNote({ affirmation, onClose, onRelease, releasing = false, reducedMotion = false }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const releaseRef = useRef<HTMLButtonElement>(null);
  const warpRef = useRef<SVGFEDisplacementMapElement>(null);
  const [filterId] = useState(() => `wish-crumple-${++noteCounter}`);
  const [warped, setWarped] = useState(true);

  // p: 0 = crumpled ball, 1 = fully open sheet.  fly: 0..1 lifts the ball away when a wish is released.
  const p = useMotionValue(reducedMotion ? 1 : 0);
  const alpha = useMotionValue(0);
  const fly = useMotionValue(0);

  const scaleBase = useTransform(p, [0, 0.3, 0.65, 0.88, 1], [0.42, 0.62, 0.95, 1.02, 1]);
  const scale = useTransform([scaleBase, fly], ([s, f]: number[]) => s * (1 - f * 0.55));
  const rotate = useTransform(p, [0, 0.3, 0.6, 0.85, 1], [-34, 12, -4, 1.2, 0]);
  const yBase = useTransform(p, [0, 0.35, 1], [70, 8, 0]);
  const y = useTransform([yBase, fly], ([b, f]: number[]) => b - f * 180);
  const clipPath = useTransform(p, [0, 0.75], [BALL, TORN]);
  const creaseOpacity = useTransform(p, [0, 0.6, 1], [1, 0.45, 0]);
  const tapeOpacity = useTransform(p, [0, 0.78, 1], [0, 0, 1]);

  // Warp the paper while it is crumpled; drop the SVG filter once it is flat so text stays crisp.
  useEffect(() => {
    const node = warpRef.current;
    if (!node) return;
    const apply = (v: number) => {
      node.setAttribute("scale", String(reducedMotion ? 0 : Math.max(0, (1 - v) * MAX_WARP)));
      const needsFilter = v < 0.995;
      setWarped((prev) => (prev === needsFilter ? prev : needsFilter));
    };
    apply(p.get());
    return p.on("change", apply);
  }, [p, reducedMotion]);

  // Opening: the ball appears, then uncrumples into the note.
  useEffect(() => {
    const fade = animate(alpha, 1, { duration: 0.14 });
    const open = reducedMotion ? undefined : animate(p, 1, { duration: 1.2, ease: UNFOLD });
    return () => { fade.stop(); open?.stop(); };
  }, [alpha, p, reducedMotion]);

  // Closing: crumple back into a ball.  When a wish is released, the ball floats up like a lantern.
  const [isPresent, safeToRemove] = usePresence();
  const exitRefs = useRef({ releasing, reducedMotion, safeToRemove });
  useEffect(() => { exitRefs.current = { releasing, reducedMotion, safeToRemove }; });
  useEffect(() => {
    if (isPresent) return;
    const { releasing: release, reducedMotion: reduced, safeToRemove: done } = exitRefs.current;
    const run = async () => {
      if (reduced) {
        await animate(alpha, 0, { duration: 0.15 });
      } else if (release) {
        await animate(p, 0, { duration: 0.85, ease: CRUMPLE_IN });
        await Promise.all([animate(fly, 1, { duration: 0.9, ease: FLY }), animate(alpha, 0, { duration: 0.5, delay: 0.4 })]);
      } else {
        await Promise.all([animate(p, 0, { duration: 0.72, ease: CRUMPLE_IN }), animate(alpha, 0, { duration: 0.16, delay: 0.6 })]);
      }
      done?.();
    };
    void run();
  }, [isPresent, alpha, p, fly]);

  useEffect(() => { closeRef.current?.focus(); }, []);
  const trapFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") { event.preventDefault(); onClose(); }
    if (event.key !== "Tab") return;
    if (event.shiftKey && document.activeElement === closeRef.current) { event.preventDefault(); releaseRef.current?.focus(); }
    else if (!event.shiftKey && document.activeElement === releaseRef.current) { event.preventDefault(); closeRef.current?.focus(); }
  };

  return <motion.article className="affirmation-note wish-note" style={{ opacity: alpha, scale, rotate, y }} role="dialog" aria-modal="true" aria-labelledby="affirmation-text" aria-describedby="wish-note-opening affirmation-text" onKeyDown={trapFocus}>
    <svg className="wish-filter-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="7" result="noise"/>
          <feDisplacementMap ref={warpRef} in="SourceGraphic" in2="noise" scale={reducedMotion ? 0 : MAX_WARP} xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
    </svg>
    <motion.span className="wish-tape" aria-hidden="true" style={{ opacity: tapeOpacity }}/>
    <motion.div className="wish-sheet" style={{ clipPath, filter: warped && !reducedMotion ? `url(#${filterId})` : "none" }}>
      <motion.div className="wish-creases" aria-hidden="true" style={{ opacity: creaseOpacity }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
          <polygon points="0,0 34,0 21,28" fill="rgba(255,255,255,.30)"/>
          <polygon points="34,0 71,0 52,24" fill="rgba(70,45,20,.20)"/>
          <polygon points="71,0 100,0 100,30 80,19" fill="rgba(255,255,255,.24)"/>
          <polygon points="0,0 21,28 0,46" fill="rgba(70,45,20,.22)"/>
          <polygon points="21,28 52,24 40,52" fill="rgba(255,250,230,.28)"/>
          <polygon points="52,24 80,19 100,30 67,50" fill="rgba(70,45,20,.18)"/>
          <polygon points="0,46 21,28 40,52 17,72" fill="rgba(255,255,255,.20)"/>
          <polygon points="40,52 67,50 56,78" fill="rgba(70,45,20,.26)"/>
          <polygon points="67,50 100,30 100,64 84,70" fill="rgba(255,255,255,.26)"/>
          <polygon points="0,46 17,72 0,100" fill="rgba(70,45,20,.20)"/>
          <polygon points="17,72 40,52 56,78 38,100 0,100" fill="rgba(255,250,235,.22)"/>
          <polygon points="56,78 67,50 84,70 100,64 100,100 74,100" fill="rgba(70,45,20,.22)"/>
          <polygon points="38,100 56,78 74,100" fill="rgba(255,255,255,.20)"/>
        </svg>
      </motion.div>
      <button ref={closeRef} className="note-close" onClick={onClose} aria-label="Close this note"><X size={17}/></button>
      <div className="wish-body">
        {affirmation.category && <p className="wish-eyebrow">{smart(affirmation.category)}</p>}
        <p className="wish-opening" id="wish-note-opening">{smart(affirmation.opening || "A little note for you.")}</p>
        <span className="wish-divider" aria-hidden="true"/>
        <h2 id="affirmation-text">{smart(affirmation.message)}</h2>
      </div>
      <div className="wish-footer">
        <span className="wish-seal" aria-hidden="true"><span>♥</span></span>
        <button ref={releaseRef} onClick={onRelease} disabled={releasing}>{releasing ? "Letting go…" : "Release this wish"} <ArrowUpRight size={16}/></button>
      </div>
    </motion.div>
  </motion.article>;
}