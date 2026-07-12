import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp } from 'lucide-react'
import type { UserProgress } from '../store/useStore'
import {
  computeRetentionMetrics,
  d7StatusLabel,
  type D7Status,
} from '../lib/retentionAnalytics'

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
  const metrics = useMemo(() => computeRetentionMetrics(progress), [progress])

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center gap-2">
        <TrendingUp size={20} className="text-info" />
        <h2 className="text-xl font-semibold">Удержание (D7)</h2>
      </div>

      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={`text-lg font-semibold ${statusColors[metrics.d7Status]}`}>
              {d7StatusLabel(metrics.d7Status)}
            </p>
            {metrics.firstStudyDate && (
              <p className="mt-1 text-sm text-muted">
                День 0: {metrics.firstStudyDate}
                {metrics.d7Date && metrics.daysSinceStart >= 7 && (
                  <> · D7: {metrics.d7Date}</>
                )}
                {' · '}
                Прошло дней: {metrics.daysSinceStart}
              </p>
            )}
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-accent">{metrics.activeDaysFirstWeek}/7</p>
              <p className="text-xs text-muted">активных в 1-ю неделю</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gold">{metrics.totalActiveDays}</p>
              <p className="text-xs text-muted">всего дней</p>
            </div>
          </div>
        </div>

        {metrics.weekOne.length > 0 && (
          <div className="mb-8">
            <p className="mb-3 flex items-center gap-1 text-sm text-muted">
              <Calendar size={14} />
              Первая неделя (D0–D6)
            </p>
            <div className="grid grid-cols-7 gap-2">
              {metrics.weekOne.map((day) => (
                <div key={day.date} className="text-center">
                  <div
                    className={`mx-auto mb-1 flex h-10 w-full max-w-[48px] items-end justify-center rounded-lg border px-1 ${
                      day.active ? 'border-success/40 bg-success/15' : 'border-border bg-surface-2'
                    }`}
                    title={`${day.date}: ${day.minutes} мин`}
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
                {metrics.d7Active ? 'активность была ✓' : 'активности не было'}
              </p>
            )}
          </div>
        )}

        <div>
          <p className="mb-3 text-sm text-muted">Последние 14 дней</p>
          <div className="flex h-16 items-end gap-1">
            {metrics.last14Days.map((day) => (
              <div
                key={day.date}
                className="group relative flex-1"
                title={`${day.label}: ${day.active ? `${day.minutes} мин` : 'нет'}`}
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

        <p className="mt-6 text-xs text-muted">
          Локальная аналитика: данные только в вашем браузере. D7 = возвращение на 7-й день после
          первого занятия.
        </p>
      </div>
    </section>
  )
}
