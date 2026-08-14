import { useTranslation } from 'react-i18next'
import { GlossaryInlineMd } from './GlossaryInlineMd'

interface SuggestedQuestionsProps {
  suggestions: string[]
  diagnostic: boolean
  onSelect: (q: string) => void
}

export function SuggestedQuestions({ suggestions, diagnostic, onSelect }: SuggestedQuestionsProps) {
  const { t } = useTranslation()
  return (
    <div className={`px-5 py-3 border-t ${diagnostic ? 'border-amber-500/10 bg-amber-500/5' : 'border-ocean-800/20 bg-ocean-950/30'} flex flex-wrap items-center gap-2`}>
      <span className="text-sail-700 text-xs shrink-0 mr-1">{t('chat.suggestions')}</span>
      {suggestions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className={`px-3 py-1.5 border text-xs rounded-xl transition-all active:scale-[0.97] ${
            diagnostic
              ? 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-300'
              : 'bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-300'
          }`}
        >
          <GlossaryInlineMd text={q} />
        </button>
      ))}
    </div>
  )
}
