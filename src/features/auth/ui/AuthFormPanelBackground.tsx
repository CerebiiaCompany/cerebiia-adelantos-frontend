export function AuthFormPanelBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-white"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-primary/[0.04]" />

      <div className="animate-blob absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="animate-blob-delayed absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-accent/[0.07] blur-3xl" />
      <div className="animate-blob absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-3xl [animation-delay:1.5s]" />

      <div className="auth-form-dot-grid absolute inset-0 opacity-50" />

      <div className="absolute left-[4%] top-[12%] h-28 w-28 animate-float rounded-full border-[1.5px] border-primary/25 bg-white/70 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.06)] sm:left-[7%] sm:top-[16%] sm:h-40 sm:w-40" />
      <div className="absolute bottom-[18%] right-[5%] h-20 w-20 animate-float rounded-2xl border-[1.5px] border-primary/30 bg-white/50 [animation-delay:2s] sm:bottom-[22%] sm:right-[9%] sm:h-28 sm:w-28" />
      <div className="absolute right-[18%] top-[36%] h-14 w-14 animate-float rounded-full border border-primary/20 bg-white/40 [animation-delay:1s] sm:right-[24%] sm:top-[40%] sm:h-[4.5rem] sm:w-[4.5rem]" />
      <div className="absolute bottom-[30%] left-[6%] h-24 w-24 animate-spin-slow rounded-full border border-dashed border-primary/20 bg-white/30 sm:bottom-[34%] sm:left-[11%] sm:h-32 sm:w-32" />
      <div className="absolute right-[8%] top-[10%] h-16 w-16 animate-float rounded-xl border border-primary/20 bg-white/40 [animation-delay:2.5s] [transform:rotate(12deg)] sm:right-[14%] sm:top-[14%] sm:h-24 sm:w-24" />

      <svg
        className="absolute left-[10%] bottom-[8%] h-16 w-16 animate-float text-primary/25 [animation-delay:1.2s] sm:left-[18%] sm:bottom-[10%] sm:h-24 sm:w-24"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="50,8 92,75 8,75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="52" r="10" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <svg
        className="absolute right-[6%] bottom-[12%] h-20 w-20 animate-float text-primary/20 [animation-delay:0.6s] sm:right-[10%] sm:bottom-[16%] sm:h-28 sm:w-28"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 6 L93 28 L93 72 L50 94 L7 72 L7 28 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        className="absolute left-[38%] top-[6%] h-14 w-14 animate-float text-accent/25 [animation-delay:1.8s] sm:left-[42%] sm:top-[8%] sm:h-20 sm:w-20"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="18"
          y="18"
          width="64"
          height="64"
          rx="14"
          stroke="currentColor"
          strokeWidth="1.5"
          transform="rotate(45 50 50)"
        />
      </svg>
    </div>
  );
}
