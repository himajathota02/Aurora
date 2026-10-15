"use client";

import { motion } from "framer-motion";

export function SkyDissolve({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const duration = reducedMotion ? 0.16 : 1.42;
  return <div className="sky-dissolve" aria-hidden="true">
    <motion.div className="sky-dissolve-shadow"
      initial={{ opacity: 0 }}
      animate={{ opacity: reducedMotion ? [0, 0.45, 0] : [0, 0.78, 0.08] }}
      transition={{ duration, times: [0, 0.48, 1], ease: "easeInOut" }}/>
    <motion.div className="sky-dissolve-gold"
      initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.18 }}
      animate={{ opacity: reducedMotion ? [0, 0.35, 0] : [0, 0.94, 0], scale: reducedMotion ? 1 : [0.18, 1.2, 2.6] }}
      transition={{ duration, times: [0, 0.5, 1], ease: [0.2, 0.7, 0.2, 1] }}/>
    <motion.div className="sky-dissolve-ripple"
      initial={{ opacity: 0, scale: 0.35 }}
      animate={{ opacity: reducedMotion ? [0, 0.18, 0] : [0, 0.46, 0], scale: reducedMotion ? 1 : [0.35, 1.45, 2.2] }}
      transition={{ duration, delay: reducedMotion ? 0 : 0.1, times: [0, 0.42, 1], ease: "easeOut" }}/>
  </div>;
}
