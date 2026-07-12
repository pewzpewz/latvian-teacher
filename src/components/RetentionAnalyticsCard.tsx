import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp } from 'lucide-react'
import type { UserProgress } from '../store/useStore'
import { computeRetentionMetrics, type D7Status } from '../lib/retentionAnalytics'
import { useTranslation } from '../hooks/useTranslation'

type Props = {
  progress: UserProgress
}

const statusColors: Record<D7Status, string> = {
  no_data: 'text-muted',
  pending: 'text-info',
  retained: 'text-success',
  missed: 'text-gold',
}

export function RetentionAnalyticsCard({ progress }: Props) {
  const { t } = useTranslation()
  const metrics = useMemo(() => computeRetentionMetrics(progress), [progress])

  const d7Label = (status: D7Status) => t(`progress.d7_${status}`)

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center gap-2">
        <TrendingUp size={20} className="text-info" />
        <h2 className="text-xl font-semibold">{t('progress.retentionTitle')}</h2>
      </div>

      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={`text-lg font-semibold ${statusColors[metrics.d7Status]}`}>
              {d7Label(metrics.d7Status)}
            </p>
            {metrics.firstStudyDate && (
              <p className="mt-1 text-sm text-muted">
                {t('progress.retentionDay0', { date: metrics.firstStudyDate })}
                {metrics.d7Date && metrics.daysSinceStart >= 7 && (
                  <> · D7: {metrics.d7Date}</>
                )}
                {' · '}
                {t('progress.retentionDaysPassed', { count: metrics.daysSinceStart })}
              </p>
            )}
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-accent">{metrics.activeDaysFirstWeek}/7</p>
              <p className="text-xs text-muted">{t('progress.retentionActiveFirstWeek')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gold">{metrics.totalActiveDays}</p>
              <p className="text-xs text-muted">{t('progress.retentionTotalDays')}</p>
            </div>
          </div>
        </div>

        {metrics.weekOne.length > 0 && (
          <div className="mb-8">
            <p className="mb-3 flex items-center gap-1 text-sm text-muted">
              <Calendar size={14} />
              {t('progress.retentionWeekOne')}
            </p>
            <div className="grid grid-cols-7 gap-2">
              {metrics.weekOne.map((day) => (
                <div key={day.date} className="text-center">
                  <div
                    className={`mx-auto mb-1 flex h-10 w-full max-w-[48px] items-end justify-center rounded-lg border px-1 ${
                      day.active ? 'border-success/40 bg-success/15' : 'border-border bg-surface-2'
                    }`}
                    title={t('progress.retentionDayMinutes', { date: day.date, minutes: day.minutes })}
                  >
                    <motion.div
                      className={`w-full rounded-t ${day.active ? 'bg-success' : 'bg-muted/20'}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min(100, Math.max(day.active ? 20 : 8, day.minutes * 4))}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <span className="text-[10px] text-muted">{day.label}</span>
                </div>
              ))}
            </div>
            {metrics.daysSinceStart >= 7 && (
              <p className="mt-3 text-xs text-muted">
                D7 ({metrics.d7Date}):{' '}
                {metrics.d7Active ? t('progress.retentionD7Active') : t('progress.retentionD7Inactive')}
              </p>
            )}
          </div>
        )}

        <div>
          <p className="mb-3 text-sm text-muted">{t('progress.retentionLast14')}</p>
          <div className="flex h-16 items-end gap-1">
            {metrics.last14Days.map((day) => (
              <div
                key={day.date}
                className="group relative flex-1"
                title={
                  day.active
                    ? t('progress.retentionDayTooltip', { label: day.label, minutes: day.minutes })
                    : t('progress.retentionDayNone', { label: day.label })
                }
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    day.active ? 'bg-accent' : 'bg-white/5'
                  }`}
                  style={{
                    height: day.active ? `${Math.max(20, Math.min(100, day.minutes * 3))}%` : '8%',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted">
            <span>{metrics.last14Days[0]?.label}</span>
            <span>{metrics.last14Days.at(-1)?.label}</span>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted">{t('progress.retentionFooter')}</p>
      </div>
    </section>
  )
}
