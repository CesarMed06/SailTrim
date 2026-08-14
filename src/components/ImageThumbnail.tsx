export function ImageThumbnail({ src, onRemove, onClick }: { src: string; onRemove?: () => void; onClick?: () => void }) {
  return (
    <div className={`relative group shrink-0 ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <img
        src={src}
        alt=""
        className="w-16 h-16 object-cover rounded-lg border border-ocean-700/40 hover:border-cyan-500/40 transition-all"
      />
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Eliminar imagen"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
