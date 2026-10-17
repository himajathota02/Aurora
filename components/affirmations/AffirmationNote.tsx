"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useRef, type KeyboardEvent } from "react";
import type { Affirmation } from "../../types/content";

type Props = { affirmation: Affirmation; onClose: () => void; onRelease: () => void; releasing?: boolean; reducedMotion?: boolean };

export function AffirmationNote({ affirmation, onClose, onRelease, releasing = false, reducedMotion = false }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const releaseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  const trapFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") { event.preventDefault(); onClose(); }
    if (event.key !== "Tab") return;
    if (event.shiftKey && document.activeElement === closeRef.current) { event.preventDefault(); releaseRef.current?.focus(); }
    else if (!event.shiftKey && document.activeElement === releaseRef.current) { event.preventDefault(); closeRef.current?.focus(); }
  };
  const exitNote = (release: boolean) => ({
    opacity: 0,
    y: reducedMotion ? 0 : release ? -8 : 15,
    scale: reducedMotion ? 1 : release ? 0.94 : 0.97,
    scaleY: reducedMotion ? 1 : release ? 0.08 : 0.97,
    rotate: reducedMotion ? 0 : release ? -2 : 1,
    rotateX: reducedMotion || !release ? 0 : 52,
    transformOrigin: "center top",
    transition: { duration: reducedMotion ? 0.1 : release ? 0.78 : 0.64, ease: [0.2, 0.75, 0.2, 1] },
  });
  return <motion.article className="affirmation-note" initial={{ opacity: 0, y: reducedMotion ? 0 : 17, scale: reducedMotion ? 1 : 0.985, scaleY: reducedMotion ? 1 : 0.94, rotate: reducedMotion ? 0 : -0.4, rotateX: reducedMotion ? 0 : 4, transformOrigin: "center top" }} animate={{ opacity: 1, y: 0, scale: 1, scaleY: 1, rotate: 0, rotateX: 0 }} exit="exit" variants={{ exit: exitNote }} custom={releasing} transition={{ duration: reducedMotion ? 0.1 : 0.75, ease: [0.2, 0.75, 0.2, 1] }} style={{ transformStyle: "preserve-3d", perspective: 900 }} role="dialog" aria-modal="true" aria-labelledby="affirmation-text" aria-describedby="wish-note-opening affirmation-text" onKeyDown={trapFocus}>
    <button ref={closeRef} className="note-close" onClick={onClose} aria-label="Close this note"><X size={17}/></button>
    <p className="note-opening" id="wish-note-opening">{affirmation.opening || "A little note for you."}</p>
    {affirmation.category && <p className="note-category">{affirmation.category}</p>}
    <span className="note-rule"/>
    <h2 id="affirmation-text">{affirmation.message}</h2>
    <span className="note-ornament" aria-hidden="true">✧</span>
    <div className="note-footer"><span aria-hidden="true">✧</span><button ref={releaseRef} onClick={onRelease} disabled={releasing}>{releasing ? "Letting go…" : "Release wish"} <ArrowUpRight size={15}/></button></div>
  </motion.article>;
}
