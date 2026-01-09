"use client";

import { useEffect, useRef } from "react";

interface GlowingBorderProps {
  className?: string;
  delay?: number;
}

export function GlowingBorder({ className = "", delay = 0 }: GlowingBorderProps) {
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-px overflow-visible ${className}`}>
      {/* Base border line */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1e293b] to-transparent" />

      {/* Animated glow particle */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="glowing-particle absolute top-1/2 -translate-y-1/2 w-24 sm:w-32 h-[3px] rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, #0ea5e9, #06b6d4, #0ea5e9, transparent)",
            boxShadow: "0 0 15px 2px rgba(14, 165, 233, 0.5), 0 0 30px 4px rgba(6, 182, 212, 0.3)",
            animation: `borderGlow 10s linear infinite`,
            animationDelay: `${delay}s`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes borderGlow {
          0% {
            left: -15%;
            opacity: 0;
          }
          3% {
            opacity: 1;
          }
          97% {
            opacity: 1;
          }
          100% {
            left: 115%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Alternative: Canvas-based particle border for smoother animation
export function GlowingBorderCanvas({ className = "" }: GlowingBorderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particleX = -100;
    const speed = 2;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = 4 * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const width = canvas.width / window.devicePixelRatio;

      // Clear canvas
      ctx.clearRect(0, 0, width, 4);

      // Draw base line
      const baseGradient = ctx.createLinearGradient(0, 0, width, 0);
      baseGradient.addColorStop(0, "transparent");
      baseGradient.addColorStop(0.5, "rgba(30, 41, 59, 0.8)");
      baseGradient.addColorStop(1, "transparent");
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 1, width, 1);

      // Draw glowing particle
      const particleWidth = 120;
      const glowGradient = ctx.createLinearGradient(
        particleX - particleWidth / 2,
        0,
        particleX + particleWidth / 2,
        0
      );
      glowGradient.addColorStop(0, "transparent");
      glowGradient.addColorStop(0.3, "rgba(14, 165, 233, 0.8)");
      glowGradient.addColorStop(0.5, "rgba(6, 182, 212, 1)");
      glowGradient.addColorStop(0.7, "rgba(14, 165, 233, 0.8)");
      glowGradient.addColorStop(1, "transparent");

      ctx.fillStyle = glowGradient;
      ctx.fillRect(particleX - particleWidth / 2, 0, particleWidth, 4);

      // Add glow effect
      ctx.shadowColor = "rgba(6, 182, 212, 0.8)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(particleX, 2, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#06b6d4";
      ctx.fill();
      ctx.shadowBlur = 0;

      // Move particle
      particleX += speed;
      if (particleX > width + particleWidth) {
        particleX = -particleWidth;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={`absolute bottom-0 left-0 right-0 h-[4px] ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "4px" }}
      />
    </div>
  );
}
