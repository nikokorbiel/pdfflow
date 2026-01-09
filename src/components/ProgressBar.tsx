"use client";

interface ProgressBarProps {
  progress: number;
  status?: string;
}

export function ProgressBar({ progress, status }: ProgressBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--muted-foreground)] font-medium">
          {status || "Processing..."}
        </span>
        <span className="font-semibold tabular-nums">{Math.round(progress)}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        {/* Animated shimmer effect on the track */}
        <div className="absolute inset-0 animate-shimmer opacity-50" />

        {/* Progress fill with gradient */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--accent)] via-purple-500 to-[var(--accent)] transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            backgroundSize: "200% 100%",
          }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
