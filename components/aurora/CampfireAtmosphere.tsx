"use client";

import { useMemo, type CSSProperties } from "react";

function makeEmbers() {
  let seed = 47139;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xffffffff; };
  return Array.from({ length: 19 }, (_, index) => ({
    id: index,
    x: `${(random() - 0.5) * 76}px`,
    rise: `${38 + random() * 94}px`,
    delay: `${-random() * 7}s`,
    duration: `${3.8 + random() * 4.2}s`,
    size: `${1.3 + random() * 2.2}px`,
    drift: `${(random() - 0.5) * 34}px`,
  }));
}

export function CampfireAtmosphere({ videoBacked = false }: { videoBacked?: boolean }) {
  const particles = useMemo(() => makeEmbers(), []);

  return <div className="campfire-atmosphere" aria-hidden="true">
    <div className="cabin-window-wash"/>
    <div className="firelight-wash"/>
    {!videoBacked && <div className="fire-overlay-flame"><i/><i/><i/></div>}
    {!videoBacked && <div className="fire-smoke">{Array.from({ length: 5 }, (_, index) => <i key={index} style={{ "--smoke-delay": `${index * -1.4}s` } as CSSProperties}/>)}</div>}
    <div className="fire-embers">{particles.map((particle) => <i key={particle.id} style={{ "--ember-x": particle.x, "--ember-rise": particle.rise, "--ember-delay": particle.delay, "--ember-duration": particle.duration, "--ember-size": particle.size, "--ember-drift": particle.drift } as CSSProperties}/>)}</div>
    <div className="snow-reflection"/>
  </div>;
}
