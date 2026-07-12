/** Minimal, thin-stroke sound-wave mark for the resound wordmark. */
export function WaveMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <line x1="4" y1="9.5" x2="4" y2="14.5" />
      <line x1="9" y1="4.5" x2="9" y2="19.5" />
      <line x1="14" y1="7.5" x2="14" y2="16.5" />
      <line x1="19" y1="2.5" x2="19" y2="21.5" />
    </svg>
  )
}
