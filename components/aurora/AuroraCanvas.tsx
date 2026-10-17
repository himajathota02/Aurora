"use client";

import { useEffect, useRef } from "react";

type AuroraCanvasProps = { reducedMotion: boolean; warm?: boolean; finale?: boolean };
type Particle = { x: number; y: number; r: number; speed: number; drift: number; alpha: number; ember: boolean; phase: number };

function random(seed: number) {
  let value = seed >>> 0;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}

export function AuroraCanvas({ reducedMotion, warm = false, finale = false }: AuroraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionRef = useRef(reducedMotion);
  const warmRef = useRef(warm);

  useEffect(() => {
    motionRef.current = reducedMotion;
    warmRef.current = warm;
  }, [reducedMotion, warm]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;
    const ctx = context;
    let width = 0;
    let height = 0;
    let frame = 0;
    let timer = 0;
    const rand = random(982171);
    const particles: Particle[] = Array.from({ length: 110 }, (_, i) => ({
      x: rand(), y: rand(), r: rand() * 1.35 + 0.25, speed: rand() * 0.00009 + 0.000025,
      drift: (rand() - 0.5) * 0.00006, alpha: rand() * 0.4 + 0.15, ember: i < 17, phase: rand() * Math.PI * 2,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawCurtain = (time: number, layer: number) => {
      const baseY = height * (0.12 + layer * 0.075);
      const thickness = height * (0.12 + layer * 0.026);
      const phase = layer * 1.71;
      // The finale needs a clearly readable curtain drift while its film is held.
      const speed = motionRef.current ? 0.000018 : finale ? 0.000105 : 0.000075;
      const amplitude = height * (0.035 + layer * 0.005);
      const offset = time * speed;
      const gradient = ctx.createLinearGradient(0, baseY - thickness, 0, baseY + thickness * 1.15);
      gradient.addColorStop(0, "rgba(72, 220, 170, 0)");
      const strength = finale ? 2.35 : 1;
      gradient.addColorStop(0.23, `rgba(42, 203, 145, ${(0.012 + layer * 0.003) * strength})`);
      gradient.addColorStop(0.56, `rgba(80, 224, 166, ${(0.034 + layer * 0.004) * strength})`);
      gradient.addColorStop(0.82, `rgba(112, 227, 191, ${(0.018 + layer * 0.002) * strength})`);
      gradient.addColorStop(1, "rgba(80, 220, 174, 0)");
      ctx.beginPath();
      for (let x = -10; x <= width + 12; x += 10) {
        const nx = x / Math.max(width, 1);
        const wave = Math.sin(nx * 8.2 + offset + phase) * amplitude + Math.sin(nx * 3.5 - offset * 0.7 + phase) * amplitude * 0.8;
        const y = baseY + wave + Math.sin(nx * 2.4 + phase) * height * 0.025;
        if (x < 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let x = width + 10; x >= -10; x -= 10) {
        const nx = x / Math.max(width, 1);
        const wave = Math.sin(nx * 8.2 + offset + phase) * amplitude + Math.sin(nx * 3.5 - offset * 0.7 + phase) * amplitude * 0.8;
        const y = baseY + wave + Math.sin(nx * 2.4 + phase) * height * 0.025 + thickness;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.shadowColor = layer % 2 ? "rgba(53, 237, 173, .13)" : "rgba(93, 213, 211, .12)";
      ctx.shadowBlur = 56;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Sparse, wavering luminous folds add the fine vertical structure of aurora curtains.
      ctx.globalCompositeOperation = "screen";
      const beams = Math.max(9, Math.round(width / 120));
      for (let i = 0; i < beams; i++) {
        const x = (i / beams) * width + Math.sin(offset * 0.7 + i * 2.14 + phase) * width * 0.026;
        const lean = Math.sin(offset + i * 1.8 + phase) * width * 0.012;
        const top = baseY - thickness * 0.72 + Math.sin(i * 1.31 + phase) * height * 0.025;
        const bottom = baseY + thickness * 1.1 + Math.sin(offset * 0.6 + i) * height * 0.04;
        const beam = ctx.createLinearGradient(x, top, x + lean, bottom);
        beam.addColorStop(0, "rgba(98, 232, 177, 0)");
        beam.addColorStop(0.34, `rgba(148, 249, 197, ${(0.018 + 0.01 * Math.sin(i + offset)) * strength})`);
        beam.addColorStop(0.72, `rgba(55, 196, 151, ${0.025 * strength})`);
        beam.addColorStop(1, "rgba(67, 204, 171, 0)");
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.bezierCurveTo(x + lean * 0.5, top + (bottom - top) * 0.38, x - lean * 0.4, top + (bottom - top) * 0.72, x + lean, bottom);
        ctx.strokeStyle = beam;
        ctx.lineWidth = Math.max(13, width / 85);
        ctx.shadowColor = "rgba(90, 232, 169, .16)";
        ctx.shadowBlur = 22;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    };

    const tick = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 4; i++) drawCurtain(now, i);
      ctx.globalCompositeOperation = "source-over";
      for (const p of particles) {
        const speed = motionRef.current ? p.speed * 0.15 : p.speed;
        p.y += p.ember ? -speed : speed;
        p.x += p.drift * (motionRef.current ? 1 : 0.15);
        if (p.ember && p.y < -0.03) { p.y = 1.02; p.x = rand(); }
        if (!p.ember && p.y > 1.03) { p.y = -0.02; p.x = rand(); }
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.ember && !warmRef.current) continue;
        const twinkle = 0.7 + Math.sin(now * 0.0012 + p.phase) * 0.28;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.ember ? p.r * 1.3 : p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.ember ? `rgba(255, 177, 91, ${p.alpha * twinkle})` : `rgba(219, 233, 244, ${p.alpha * twinkle})`;
        if (p.ember) { ctx.shadowColor = "rgba(255, 147, 61, .9)"; ctx.shadowBlur = 9; }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // Slow, irregular fire glow ties the foreground to the source painting.
      if (warmRef.current) {
        const pulse = 0.5 + Math.sin(now * 0.0032) * 0.08 + Math.sin(now * 0.0081) * 0.025;
        const glow = ctx.createRadialGradient(width * 0.88, height * 0.8, 3, width * 0.88, height * 0.8, width * 0.25);
        glow.addColorStop(0, `rgba(255, 142, 62, ${pulse * 0.08})`);
        glow.addColorStop(1, "rgba(255, 117, 48, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }
      if (motionRef.current) timer = window.setTimeout(() => { frame = requestAnimationFrame(tick); }, 90);
      else frame = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(timer); window.removeEventListener("resize", resize); };
  }, [finale]);

  return <canvas ref={canvasRef} className="aurora-canvas" aria-hidden="true" />;
}
