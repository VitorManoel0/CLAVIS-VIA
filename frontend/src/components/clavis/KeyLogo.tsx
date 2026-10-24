export function KeyIcon({ className = "h-16 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 80" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="kg" x1="0" y1="0" x2="40" y2="80">
          <stop offset="0" stopColor="oklch(0.75 0.1 290)" />
          <stop offset="1" stopColor="oklch(0.7 0.13 255)" />
        </linearGradient>
      </defs>
      <g stroke="url(#kg)" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="14" cy="14" r="7" />
        <circle cx="26" cy="14" r="7" />
        <circle cx="20" cy="24" r="7" />
        <path d="M20 31v42M20 52h8M20 62h6" />
      </g>
    </svg>
  );
}

export function Wordmark({ size = "lg" }: { size?: "lg" | "sm" }) {
  if (size === "sm") {
    return (
      <div className="flex items-center gap-2">
        <KeyIcon className="h-8 w-4" />
        <span className="font-display text-lg tracking-[0.35em] text-navy">CLAVIS VIA</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <KeyIcon className="h-24 w-12" />
      <div className="text-center font-display text-5xl leading-tight tracking-[0.3em] text-navy">
        CLAVIS
        <br />
        VIA
      </div>
    </div>
  );
}
