import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageThumbnail } from './ImageThumbnail'

interface ChatInputProps {
  input: string
  onInputChange: (v: string) => void
  pendingImages: string[]
  onRemoveImage: (index: number) => void
  onPreviewImage: (images: string[], index: number) => void
  loading: boolean
  maxImages: number
  diagnostic: boolean
  placeholder: string
  inputRef: RefObject<HTMLTextAreaElement | null>
  fileInputRef: RefObject<HTMLInputElement | null>
  onKeyDown: (e: ReactKeyboardEvent) => void
  onSend: () => void
  onAttach: () => void
  onFiles: (files: FileList | File[]) => void
}

export function ChatInput({
  input,
  onInputChange,
  pendingImages,
  onRemoveImage,
  onPreviewImage,
  loading,
  maxImages,
  diagnostic,
  placeholder,
  inputRef,
  fileInputRef,
  onKeyDown,
  onSend,
  onAttach,
  onFiles,
}: ChatInputProps) {
  const { t } = useTranslation()

  return (
    <div className={`space-y-2 p-4 border-t ${diagnostic ? 'border-amber-500/10' : 'border-ocean-800/20'} bg-ocean-950/40`}>
      {pendingImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pendingImages.map((img, idx) => (
            <ImageThumbnail
              key={idx}
              src={img}
              onRemove={() => onRemoveImage(idx)}
              onClick={() => onPreviewImage(pendingImages, idx)}
            />
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={pendingImages.length > 0 ? t('chat.imagePlaceholder') : placeholder}
          rows={2}
          disabled={loading}
          className="flex-1 resize-none bg-ocean-950/60 border border-ocean-800/30 focus:border-cyan-500/40 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-sail-200 placeholder-sail-700 disabled:opacity-50 transition-all"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <button
          onClick={onAttach}
          disabled={loading || pendingImages.length >= maxImages}
          aria-label={t('chat.attachImage')}
          className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 ${
            pendingImages.length >= maxImages
              ? 'bg-ocean-950/60 text-sail-700 cursor-not-allowed'
              : 'bg-ocean-900/60 border border-ocean-700/40 hover:border-cyan-500/40 text-sail-400 hover:text-cyan-300 hover:bg-ocean-800/60'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <button
          onClick={onSend}
          aria-label={t('chat.sendAria')}
          disabled={(!input.trim() && pendingImages.length === 0) || loading}
          className={`shrink-0 w-11 h-11 flex items-center justify-center bg-gradient-to-br ${
            diagnostic
              ? 'from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20'
              : 'from-cyan-500 to-wind-500 hover:from-cyan-400 hover:to-wind-400 shadow-cyan-500/20'
          } disabled:from-ocean-800 disabled:to-ocean-800 disabled:text-sail-700 text-white rounded-xl transition-all duration-300 active:scale-[0.95] disabled:cursor-not-allowed shadow-lg`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
