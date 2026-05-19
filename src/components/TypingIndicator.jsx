export default function TypingIndicator({ typers }) {
  if (!typers || typers.length === 0) return null

  const label =
    typers.length === 1 ? `${typers[0]} is typing` :
    typers.length === 2 ? `${typers[0]} and ${typers[1]} are typing` :
    'Several people are typing'

  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 bg-purple-400 rounded-full"
          style={{ animation: 'typingBounce 1s infinite', animationDelay: `${i * 0.15}s` }}
        />
      ))}
      <span className="text-[11px] text-purple-400 italic">{label}...</span>
    </div>
  )
}
