import type { ChatEntry } from '../lib/chat'
import { ChatMarkdown } from './ChatMarkdown'
import { ImageThumbnail } from './ImageThumbnail'
import { MessageCopyButton } from './MessageCopyButton'

interface MessageBubbleProps {
  msg: ChatEntry
  bubbleClass: string
  onImageClick: (images: string[], index: number) => void
}

export function MessageBubble({ msg, bubbleClass, onImageClick }: MessageBubbleProps) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div
        className={`relative group max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-cyan-500/20 to-wind-500/20 border border-cyan-500/30 text-sail-200'
            : `${bubbleClass} text-sail-300`
        }`}
      >
        {isUser ? (
          <div className="space-y-2">
            {msg.images && msg.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-1">
                {msg.images.map((img, idx) => (
                  <ImageThumbnail
                    key={idx}
                    src={img}
                    onClick={() => onImageClick(msg.images ?? [], idx)}
                  />
                ))}
              </div>
            )}
            {msg.content && msg.content !== ' ' && <p>{msg.content}</p>}
          </div>
        ) : (
          <>
            <ChatMarkdown text={msg.content} />
            <MessageCopyButton text={msg.content} />
          </>
        )}
      </div>
    </div>
  )
}
