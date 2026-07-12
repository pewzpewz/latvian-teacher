import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Map, ChevronRight, CheckCircle2 } from 'lucide-react'
import {
  getCefrTracks,
  buildCefrTrackProgress,
  overallCefrLevel,
} from '../lib/cefrProgress'
import { useStore } from '../store/useStore'
import { useTranslation } from '../hooks/useTranslation'

const LEVEL_COLORS: Record<string, string> = {
  A1: 'text-green-400',
  A2: 'text-blue-400',
  B1: 'text-purple-400',
  B2: 'text-gold',
}

export function CefrPage() {
  const { t } = useTranslation()
  const progress = useStore((s) => s.progress)
  const estimated = overallCefrLevel(progress, t)
  const tracks = useMemo(() => getCefrTracks(t), [t])

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 md:p-8">
      <div>
        <div className="flex items-center gap-3">
          <Map size={28} className="text-accent" />
          <div>
            <h1 className="text-2xl font-semibold">{t('cefr.title')}</h1>
            <p className="text-muted">{t('cefr.subtitle')}</p>
          </div>
        </div>
        <p className="mt-4 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
          {t('cefr.currentLevel')}{' '}
          <strong className={`text-lg ${LEVEL_COLORS[estimated] ?? 'text-accent'}`}>{estimated}</strong>
          {' · '}
          {t('cefr.adaptiveEstimate')} <strong>{progress.estimatedLevel}</strong>
        </p>
      </div>

      {tracks.map((track) => {
        const milestones = buildCefrTrackProgress(progress, track)
        const avg = milestones.reduce((s, m) => s + m.progress, 0) / milestones.length
        const pct = Math.round(avg * 100)

        return (
          <section key={track.level} className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <span className={`text-xs font-semibold uppercase ${LEVEL_COLORS[track.level] ?? ''}`}>
                  {track.level}
                </span>
                <h2 className="text-lg font-semibold">{track.title}</h2>
                <p className="mt-1 text-sm text-muted">{track.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent">{pct}%</div>
                <div className="text-xs text-muted">{t('cefr.overallProgress')}</div>
              </div>
            </div>

            <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>

            <ul className="space-y-2">
              {milestones.map((m) => (
                <li key={m.id}>
                  <Link
                    to={m.link}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2.5 text-sm transition-colors hover:border-accent/40"
                  >
                    <div className="flex items-center gap-2">
                      {m.done ? (
                        <CheckCircle2 size={16} className="shrink-0 text-green-500" />
                      ) : (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted text-[10px] text-muted">
                          {Math.round(m.progress * 100)}
                        </span>
                      )}
                      <div>
                        <div className="font-medium">{m.title}</div>
                        <div className="text-xs text-muted">{m.description}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
