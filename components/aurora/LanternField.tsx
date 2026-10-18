"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { wishLanterns, wishLanternPositions, wishLanternVideoPositions, wishLanternVideoPortraitPositions } from "../../data/wish-lanterns";

type DecorativeLantern = { x: number; y: number; scale: number; phase: number; speed: number; glow: number; hue: number };
type Props = { active: boolean; cabinPreview?: boolean; videoFinale?: boolean; finaleRevealed?: boolean; videoSelectable?: boolean; selectedId: string | null; releasedIds?: ReadonlySet<string>; releasing: boolean; reducedMotion: boolean; onSelect: (id: string) => void };

function makeLanterns(count: number): DecorativeLantern[] {
  let seed = 280194;
  const next = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  return Array.from({ length: count }, () => ({
    x: 2 + next() * 96,
    y: 5 + next() * 78,
    scale: 0.35 + next() * 1.02,
    phase: next() * Math.PI * 2,
    speed: 0.3 + next() * 0.75,
    glow: 0.25 + next() * 0.5,
    hue: next(),
  })).sort((a, b) => a.scale - b.scale);
}

export function LanternField({ active, cabinPreview = false, videoFinale = false, finaleRevealed = true, videoSelectable = true, selectedId, releasedIds = new Set<string>(), releasing, reducedMotion, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [focusId, setFocusId] = useState(0);
  const lanterns = useMemo(() => makeLanterns(30), []);

  useEffect(() => {
    if (!active) return;
    
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !host || !context) return;

    let frame = 0;
    let width = 1;
    let height = 1;
    const resize = () => {
      cancelAnimationFrame(frame);
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 650 ? 1.25 : 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw(performance.now());
    };
    const draw = (now: number) => {
      if (!canvas.width || !canvas.height) return;
      const time = reducedMotion ? 0 : now / 1000;
      context.clearRect(0, 0, width, height);
      const visibleCount = width < 650 ? Math.min(200, lanterns.length) : lanterns.length;
      for (let index = 0; index < visibleCount; index++) {
        const lamp = lanterns[index];
        const size = lamp.scale;
        const x = (lamp.x + Math.sin(time * 0.045 * lamp.speed + lamp.phase) * (0.28 + size * 0.22)) * width / 100;
        const y = (lamp.y + Math.sin(time * 0.12 * lamp.speed + lamp.phase) * (0.42 + size * 0.34)) * height / 100;
        const bodyWidth = 3.1 + size * 3.7;
        const bodyHeight = bodyWidth * 1.72;
        const alpha = lamp.glow * (0.83 + Math.sin(time * 0.31 + lamp.phase) * 0.08);
        const gold = lamp.hue > 0.88 ? "255,222,166" : "255,190,105";

        const halo = context.createRadialGradient(x, y, 0, x, y, bodyHeight * 2.2);
        halo.addColorStop(0, `rgba(${gold},${alpha * 0.22})`);
        halo.addColorStop(0.38, `rgba(255,172,83,${alpha * 0.09})`);
        halo.addColorStop(1, "rgba(255,172,83,0)");
        context.fillStyle = halo;
        context.beginPath();
        context.arc(x, y, bodyHeight * 2.2, 0, Math.PI * 2);
        context.fill();

        const paper = context.createLinearGradient(x - bodyWidth / 2, y, x + bodyWidth / 2, y);
        paper.addColorStop(0, `rgba(188,111,49,${alpha * 0.7})`);
        paper.addColorStop(0.48, `rgba(255,224,160,${alpha})`);
        paper.addColorStop(1, `rgba(226,153,68,${alpha * 0.8})`);
        context.fillStyle = paper;
        context.shadowColor = `rgba(255,187,95,${alpha * 0.65})`;
        context.shadowBlur = 3 + size * 4;
        context.beginPath();
        context.moveTo(x - bodyWidth * 0.42, y - bodyHeight * 0.43);
        context.lineTo(x + bodyWidth * 0.42, y - bodyHeight * 0.43);
        context.lineTo(x + bodyWidth * 0.5, y + bodyHeight * 0.3);
        context.lineTo(x + bodyWidth * 0.28, y + bodyHeight * 0.5);
        context.lineTo(x - bodyWidth * 0.28, y + bodyHeight * 0.5);
        context.lineTo(x - bodyWidth * 0.5, y + bodyHeight * 0.3);
        context.closePath();
        context.fill();
        context.shadowBlur = 0;
        context.strokeStyle = `rgba(255,225,177,${alpha * 0.34})`;
        context.lineWidth = 0.55;
        context.beginPath();
        context.moveTo(x - bodyWidth * 0.35, y - bodyHeight * 0.51);
        context.lineTo(x + bodyWidth * 0.35, y - bodyHeight * 0.51);
        context.moveTo(x, y + bodyHeight * 0.48);
        context.lineTo(x, y + bodyHeight * 0.74);
        context.stroke();
      }
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [active, lanterns, reducedMotion]);

  useEffect(() => {
    if (!videoFinale) return;
    const host = hostRef.current;
    if (!host) return;
    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      const scale = Math.max(width / 1280, height / 720);
      const renderedWidth = 1280 * scale;
      const renderedHeight = 720 * scale;
      const left = (width - renderedWidth) / 2;
      const top = (height - renderedHeight) / 2;
      const cropLeft = Math.max(0, left);
      const cropTop = Math.max(0, top);
      const cropWidth = Math.max(1, Math.min(width, left + renderedWidth) - cropLeft);
      const cropHeight = Math.max(1, Math.min(height, top + renderedHeight) - cropTop);
      host.querySelectorAll<HTMLButtonElement>("[data-video-lantern]").forEach((button) => {
        const index = Number(button.dataset.lanternIndex);
        const portrait = width / Math.max(1, height) < 1;
        const point = portrait ? wishLanternVideoPortraitPositions[index] : wishLanternVideoPositions[index];
        if (!point) return;
        const x = portrait ? cropLeft + cropWidth * point.x / 100 : left + renderedWidth * point.x / 100;
        const y = portrait ? cropTop + cropHeight * point.y / 100 : top + renderedHeight * point.y / 100;
        button.style.setProperty("--fx", `${x}px`);
        button.style.setProperty("--fy", `${y}px`);
      });
      host.dataset.positioned = "true";
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    window.addEventListener("resize", resize, { passive: true });
    resize();
    return () => { observer.disconnect(); window.removeEventListener("resize", resize); };
  }, [videoFinale]);

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, current: number) => {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const available = wishLanterns.flatMap((wish, index) => releasedIds.has(wish.id) ? [] : [index]);
    if (!available.length) return;
    const currentPosition = available.indexOf(current);
    const nextPosition = event.key === "Home" ? 0 : event.key === "End" ? available.length - 1 : (currentPosition + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + available.length) % available.length;
    const next = available[nextPosition];
    setFocusId(next);
    requestAnimationFrame(() => document.getElementById(`aurora-lantern-${wishLanterns[next]?.id}`)?.focus());
  };

  const interactive = active || cabinPreview || videoFinale;

  const wishCount = wishLanterns.length;

  return <div ref={hostRef} className={`lantern-field ${active ? "is-active" : cabinPreview ? "is-cabin-preview" : videoFinale ? "is-video-finale" : "is-distant"} ${selectedId !== null ? "has-selection" : ""}`} data-revealed={videoFinale && finaleRevealed ? "true" : undefined} role="group" aria-label={videoFinale ? `${wishCount} special wish lanterns over the final sky frame` : cabinPreview ? `${wishCount} wish lanterns above the cabin; choose one to enter the sky` : `${wishCount} special wish lanterns`} aria-hidden={!interactive}>
    <canvas ref={canvasRef} className="lantern-decoration-canvas" aria-hidden="true"/>
    {wishLanternPositions.map((lantern, index) => {
      const wish = wishLanterns[index];
      if (!wish) return null;
      const id = wish.id;
      const videoPoint = wishLanternVideoPositions[index];
const portraitPoint = wishLanternVideoPortraitPositions[index] ?? videoPoint;

const style = {
  "--x": `${lantern.x}%`,
  "--y": `${lantern.y}%`,
  "--mx": `${lantern.mobileX}%`,
  "--my": `${lantern.mobileY}%`,
  "--cx": `${lantern.cabinX}%`,
  "--cy": `${lantern.cabinY}%`,
  "--fx": `${videoPoint.x}%`,
  "--fy": `${videoPoint.y}%`,
  "--fmx": `${portraitPoint.x}%`,
  "--fmy": `${portraitPoint.y}%`,
        "--scale": lantern.scale.toFixed(2), "--glow": lantern.glow.toFixed(2), "--delay": `${-(index * 1.63).toFixed(2)}s`,
        "--reveal-delay": `${reducedMotion ? 0 : index * 0.08}s`,
        "--float": `${8 + (index % 4) * 1.7}s`, "--lantern-width": `${10 + lantern.scale * 3}px`, "--lantern-height": `${19 + lantern.scale * 5}px`,
        "--final-paper-width": `${22 + lantern.scale * 7}px`, "--final-paper-height": `${33 + lantern.scale * 12}px`,
        "--flicker-delay": `${-(index % 7) * 0.19}s`, "--flicker-duration": `${1.35 + (index % 5) * 0.17}s`,
        "--ember-delay": `${-(index % 9) * 0.37}s`,
      } as CSSProperties;
      const chosen = selectedId === id;
      const isReleased = releasedIds.has(id);
      return <button className={`lantern-hit ${chosen ? "is-selected" : ""} ${chosen && releasing ? "is-releasing" : ""} ${isReleased ? "is-released" : ""}`} style={style} key={id} id={`aurora-lantern-${id}`} data-lantern-id={id} data-lantern-index={index} data-video-lantern={videoFinale ? "true" : undefined}
        aria-label={isReleased ? `Wish lantern ${index + 1} has been released` : `${cabinPreview ? "Enter the sky with" : "Read"} wish lantern ${index + 1}`} aria-pressed={chosen} tabIndex={interactive && selectedId === null && (!videoFinale || videoSelectable) && !isReleased && focusId === index ? 0 : -1} disabled={isReleased || (videoFinale && !videoSelectable) || (chosen && releasing)}
        onFocus={() => setFocusId(index)} onKeyDown={(event) => moveFocus(event, index)} onClick={() => { if (selectedId !== null || isReleased || (videoFinale && !videoSelectable)) return; setFocusId(index); onSelect(id); }}>
        <span className="lantern-glow" aria-hidden="true"/>
        <span className="lantern-paper" aria-hidden="true"><span className="lantern-paper-seam"/><span className="lantern-panels"><i/><i/><i/><i/><i/><i/></span></span>
        <span className="lantern-frame" aria-hidden="true"/>
        <span className="lantern-flame" aria-hidden="true"/>
        <span className="lantern-ember lantern-ember-one" aria-hidden="true"/>
        <span className="lantern-ember lantern-ember-two" aria-hidden="true"/>
        <span className="lantern-thread" aria-hidden="true"/>
      </button>;
    })}
  </div>;
}