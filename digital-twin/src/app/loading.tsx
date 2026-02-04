export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-[var(--background)]">
      <div className="text-center">
        {/* Animated logo */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[var(--primary)] rounded-3xl blur-2xl opacity-30 animate-pulse" />
          <div className="relative w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-xl animate-float">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 15.5m14.8-.2a9 9 0 10-15.6.2"
              />
            </svg>
          </div>
        </div>

        {/* Loading text */}
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          Loading Digital Twin
        </h2>
        <p className="text-sm text-[var(--foreground-muted)] mb-6">
          Preparing your AI experience...
        </p>

        {/* Animated loading bar */}
        <div className="w-48 h-1 mx-auto bg-[var(--surface)] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full animate-shimmer" />
        </div>

        {/* Loading dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-typing-1" />
          <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-typing-2" />
          <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-typing-3" />
        </div>
      </div>
    </div>
  );
}
