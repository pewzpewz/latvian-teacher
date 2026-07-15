import { RotateCcw } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import type { UserProgress } from '../../store/types'

type Props = {
  progress: UserProgress
  onResetProgress: () => void
}

export function SettingsDataSection({ progress, onResetProgress }: Props) {
  const { t } = useTranslation()

  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="mb-4 font-semibold">{t('settings.data')}</h2>
      <div className="mb-4 space-y-1 text-sm text-muted">
        <p>{t('settings.dataLessons', { count: progress.completedLessons.length })}</p>
        <p>{t('settings.dataWords', { count: progress.wordsLearned })}</p>
        <p>{t('settings.dataTime', { minutes: progress.totalStudyMinutes })}</p>
      </div>
      <button
        type="button"
        onClick={onResetProgress}
        className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
      >
        <RotateCcw size={14} />
        {t('settings.resetProgress')}
      </button>
    </section>
  )
}
