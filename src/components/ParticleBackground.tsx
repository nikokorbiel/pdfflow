"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  pathPoints: { x: number; y: number }[];
  progress: number;
  speed: number;
  color: string;
  size: number;
  opacity: number;
  trail: { x: number; y: number; opacity: number }[];
}

const COLORS = ["#0ea5e9", "#06b6d4", "#14b8a6", "#38bdf8"];

function generateBezierPath(
  startX: number,
  startY: number,
  width: number,
  height: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const endX = width + 100;
  const cp1X = startX + (width * 0.3 + Math.random() * width * 0.2);
  const cp1Y = startY + (Math.random() - 0.5) * height * 0.4;
  const cp2X = startX + (width * 0.6 + Math.random() * width * 0.2);
  const cp2Y = startY + (Math.random() - 0.5) * height * 0.4;

  // Generate points along the bezier curve
  for (let t = 0; t <= 1; t += 0.01) {
    const x =
      Math.pow(1 - t, 3) * startX +
      3 * Math.pow(1 - t, 2) * t * cp1X +
      3 * (1 - t) * Math.pow(t, 2) * cp2X +
      Math.pow(t, 3) * endX;
    const y =
      Math.pow(1 - t, 3) * startY +
      3 * Math.pow(1 - t, 2) * t * cp1Y +
      3 * (1 - t) * Math.pow(t, 2) * cp2Y +
      Math.pow(t, 3) * startY;
    points.push({ x, y });
  }

  return points;
}

function createParticle(width: number, height: number): Particle {
  const startX = -50;
  const startY = Math.random() * height;
  const pathPoints = generateBezierPath(startX, startY, width, height);

  return {
    x: startX,
    y: startY,
    pathPoints,
    progress: 0,
    speed: 0.002 + Math.random() * 0.003, // 0.002-0.005
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 2 + Math.random() * 2, // 2-4px
    opacity: 0.3 + Math.random() * 0.3, // 0.3-0.6
    trail: [],
  };
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const dimensionsRef = useRef({ width: 0, height: 0 });

  const initParticles = useCallback(() => {
    const { width, height } = dimensionsRef.current;
    if (width === 0 || height === 0) return;

    // Reduce particle count on mobile
    const isMobile = width < 768;
    const count = isMobile ? 35 : 60;

    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(width, height)
    );

    // Spread particles across the path initially
    particlesRef.current.forEach((p, i) => {
      p.progress = (i / count) * 0.8; // Spread from 0% to 80% along path
      const pointIndex = Math.floor(p.progress * (p.pathPoints.length - 1));
      if (p.pathPoints[pointIndex]) {
        p.x = p.pathPoints[pointIndex].x;
        p.y = p.pathPoints[pointIndex].y;
      }
    });
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensionsRef.current;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    particlesRef.current.forEach((particle) => {
      // Update progress
      particle.progress += particle.speed;

      // Respawn if finished
      if (particle.progress >= 1) {
        const newParticle = createParticle(width, height);
        Object.assign(particle, newParticle);
        return;
      }

      // Get current position from path
      const pointIndex = Math.floor(
        particle.progress * (particle.pathPoints.length - 1)
      );
      const point = particle.pathPoints[pointIndex];
      if (point) {
        particle.x = point.x;
        particle.y = point.y;
      }

      // Update trail
      particle.trail.unshift({
        x: particle.x,
        y: particle.y,
        opacity: particle.opacity,
      });

      // Limit trail length
      const maxTrailLength = 30;
      if (particle.trail.length > maxTrailLength) {
        particle.trail.pop();
      }

      // Draw trail
      particle.trail.forEach((trailPoint, index) => {
        const trailOpacity =
          trailPoint.opacity * (1 - index / particle.trail.length) * 0.5;
        const trailSize = particle.size * (1 - index / particle.trail.length);

        ctx.beginPath();
        ctx.arc(trailPoint.x, trailPoint.y, trailSize, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = trailOpacity;
        ctx.fill();
      });

      // Draw particle with glow
      ctx.globalAlpha = particle.opacity;

      // Outer glow
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 4
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(0.5, particle.color + "40");
      gradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      dimensionsRef.current = { width: rect.width, height: rect.height };
      initParticles();
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initParticles, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="particles-canvas absolute inset-0 z-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  );
}
