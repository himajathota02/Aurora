import { motion } from "framer-motion";
import type { Song } from "../../types/content";

export function CassetteIllustration({ song, playing, reducedMotion = false }: { song: Song | null; playing: boolean; reducedMotion?: boolean }) {
  return <motion.div className="cassette-stage" initial={{ opacity: 0, y: reducedMotion ? 0 : 25, rotateX: reducedMotion ? 0 : 7, scale: reducedMotion ? 1 : 0.96 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} transition={{ duration: reducedMotion ? 0.12 : 0.9, ease: [0.2, 0.75, 0.2, 1] }}>
    <div className="cassette-shadow"/>
    <div className={`cassette-shell ${playing ? "is-playing" : ""}`}>
      <div className="cassette-edge"/>
      <div className="cassette-label"><span>AURORA · SIDE A</span><strong>{song?.title || "a quiet side"}</strong><em>{song?.artist || "from your Songs folder"}</em><i>00:00 — ∞</i></div>
      <div className="cassette-window"><div className="tape-loop"/><span className={`tape-reel reel-left ${playing ? "turning" : ""}`}><i/></span><span className={`tape-reel reel-right ${playing ? "turning reverse" : ""}`}><i/></span><div className="tape-head"/></div>
      <div className="cassette-screws"><i/><i/><i/><i/></div>
      <div className="cassette-bottom"><span>HIGH BIAS · 60 MIN</span><i/><span>DOLBY SYSTEM</span></div>
      <div className="cassette-glint"/>
    </div>
    <p className="cassette-caption">a thought he kept close</p>
  </motion.div>;
}
