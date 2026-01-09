"use client";

import { useId } from "react";
import styles from "./PDFflowLogo.module.css";

type LogoVariant = "default" | "mono-white" | "mono-dark";

interface PDFflowLogoProps {
  size?: number;
  variant?: LogoVariant;
  withWordmark?: boolean;
  className?: string;
  animated?: boolean;
}

export function PDFflowLogo({
  size = 32,
  variant = "default",
  withWordmark = false,
  className = "",
  animated = true,
}: PDFflowLogoProps) {
  const reactId = useId();
  const id = `pdfflow${reactId.replace(/:/g, "")}`;
  const wordmarkSize = size * 0.65;

  const renderColorLogo = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="PDFflow logo"
      className={`${styles.logoIcon} ${animated ? styles.animated : ""}`}
    >
      <defs>
        <linearGradient id={`${id}-main`} x1="20%" y1="80%" x2="80%" y2="20%">
          <stop offset="0%" stopColor="#0044AA" />
          <stop offset="35%" stopColor="#0088CC" />
          <stop offset="65%" stopColor="#00BBDD" />
          <stop offset="100%" stopColor="#22DDCC" />
        </linearGradient>
        <linearGradient id={`${id}-dark`} x1="20%" y1="80%" x2="80%" y2="20%">
          <stop offset="0%" stopColor="#003388" />
          <stop offset="50%" stopColor="#0066AA" />
          <stop offset="100%" stopColor="#0099BB" />
        </linearGradient>
        <linearGradient id={`${id}-light`} x1="20%" y1="80%" x2="80%" y2="20%">
          <stop offset="0%" stopColor="#00CCDD" />
          <stop offset="100%" stopColor="#44FFEE" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Back wave layer - darkest */}
      <path
        className={styles.backWave}
        d="M20 58
           Q8 52 12 38
           Q16 24 32 18
           Q48 12 62 22
           Q72 30 70 44
           Q68 54 58 58
           Q52 60 48 56
           Q44 52 48 46
           Q52 42 58 46
           Q62 50 58 54
           L92 48
           Q96 47 94 42
           Q90 28 74 18
           Q58 8 38 12
           Q18 16 10 34
           Q4 50 14 62
           Q24 72 42 70
           Q54 68 62 60
           L20 58Z"
        fill={`url(#${id}-dark)`}
      />

      {/* Main wave layer */}
      <path
        className={styles.mainWave}
        d="M22 54
           Q12 48 16 36
           Q20 24 36 20
           Q52 16 64 28
           Q72 38 66 50
           Q62 58 52 56
           Q46 54 48 48
           Q50 44 56 48
           L88 44
           Q92 43 88 36
           Q82 24 66 18
           Q50 12 36 18
           Q22 24 18 40
           Q14 54 26 62
           Q36 68 50 64
           L22 54Z"
        fill={`url(#${id}-main)`}
        filter={`url(#${id}-glow)`}
      />

      {/* Top highlight layer */}
      <path
        className={styles.highlight}
        d="M38 22
           Q52 18 64 28
           Q72 36 68 48
           L62 44
           Q64 36 58 30
           Q50 24 40 28
           Q32 32 32 42
           L26 38
           Q28 26 38 22Z"
        fill={`url(#${id}-light)`}
        opacity="0.5"
      />

      {/* Inner curl accent */}
      <path
        className={styles.innerCurl}
        d="M48 50
           Q52 48 54 52
           Q56 56 52 58
           Q48 58 48 54
           Q48 52 48 50Z"
        fill={`url(#${id}-light)`}
        opacity="0.7"
      />
    </svg>
  );

  const renderMonoLogo = (color: string) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="PDFflow logo"
      className={`${styles.logoIcon} ${animated ? styles.animated : ""}`}
    >
      <path
        d="M22 54
           Q12 48 16 36
           Q20 24 36 20
           Q52 16 64 28
           Q72 38 66 50
           Q62 58 52 56
           Q46 54 48 48
           Q50 44 56 48
           L88 44
           Q92 43 88 36
           Q82 24 66 18
           Q50 12 36 18
           Q22 24 18 40
           Q14 54 26 62
           Q36 68 50 64
           L22 54Z"
        fill={color}
      />
    </svg>
  );

  return (
    <div
      className={`${styles.logoContainer} ${className}`}
      style={{ display: "inline-flex", alignItems: "center", gap: size * 0.375 }}
    >
      {variant === "default" ? renderColorLogo() : renderMonoLogo(variant === "mono-white" ? "#fff" : "#0a0a0f")}

      {withWordmark && (
        <span className={styles.wordmark} style={{ fontSize: wordmarkSize, lineHeight: 1 }}>
          <span className={styles.pdf} style={{ color: variant === "mono-dark" ? "#0a0a0f" : "#ffffff" }}>
            PDF
          </span>
          <span
            className={styles.flow}
            style={{
              background: variant === "default" ? "linear-gradient(90deg, #00AADD 0%, #22DDCC 100%)" : undefined,
              WebkitBackgroundClip: variant === "default" ? "text" : undefined,
              WebkitTextFillColor: variant === "default" ? "transparent" : undefined,
              backgroundClip: variant === "default" ? "text" : undefined,
              color: variant !== "default" ? (variant === "mono-white" ? "#fff" : "#0a0a0f") : undefined,
            }}
          >
            flow
          </span>
        </span>
      )}
    </div>
  );
}

export function PDFflowIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return <PDFflowLogo size={size} className={className} withWordmark={false} />;
}

export default PDFflowLogo;
