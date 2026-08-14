export function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1.5 px-2">
      <span className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce [animation-delay:300ms]" />
    </div>
  )
}
