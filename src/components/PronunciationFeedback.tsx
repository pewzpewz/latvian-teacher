import type { PhonemeChar } from '../lib/phonemeFeedback'
import { useTranslation } from '../hooks/useTranslation'

const statusClass: Record<PhonemeChar['status'], string> = {
  match: 'text-success',
  diacritic: 'text-gold underline decoration-gold/60',
  wrong: 'text-red-400 bg-red-500/15 rounded px-0.5',
  missing: 'text-red-400 line-through opacity-70',
}

type Props = {
  chars: PhonemeChar[]
  tips?: string[]
  spoken?: string
}

export function PronunciationFeedback({ chars, tips = [], spoken }: Props) {
  const { t } = useTranslation()

  return (
    <div className="mt-3 text-left text-sm" data-testid="pronunciation-feedback">
      <p className="mb-2 text-xs text-muted">{t('speak.expectedPhoneme')}</p>
      <p className="latvian-text mb-3 text-xl font-medium leading-relaxed">
        {chars.map((c, i) => (
          <span key={`${c.char}-${i}`} className={statusClass[c.status]}>
            {c.char}
          </span>
        ))}
      </p>
      {spoken && (
        <p className="mb-2 text-xs text-muted">
          {t('speak.recognized')} <span className="latvian-text text-text">{spoken}</span>
        </p>
      )}
      {tips.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-gold/10 px-3 py-2 text-xs text-gold">
          {tips.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
