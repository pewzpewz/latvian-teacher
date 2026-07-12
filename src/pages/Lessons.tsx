import { Link } from 'react-router-dom'
import { Clock, CheckCircle } from 'lucide-react'
import { lessons, levelColors } from '../data/lessons'
import { LVA_THEMES } from '../data/lvaThemes'
import { useStore } from '../store/useStore'

export function Lessons() {
  const completedLessons = useStore((s) => s.progress.completedLessons)

  const byTheme = LVA_THEMES.map((theme) => {
    const items = lessons
      .filter((l) => l.lvaTheme === theme.id)
      .sort((a, b) => a.level.localeCompare(b.level) || a.title.localeCompare(b.title))
    const done = items.filter((l) => completedLessons.includes(l.id)).length
    return { theme, items, done, total: items.length }
  }).filter((g) => g.total > 0)

  return (
    <div>
      <h1 className="gradient-text mb-2 text-3xl font-bold">Уроки</h1>
      <p className="mb-8 text-muted">
        Программа по 7 темам LVA — от знакомства до подготовки к B1
      </p>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {byTheme.map(({ theme, done, total }) => (
          <div key={theme.id} className="glass rounded-xl p-4">
            <p className="text-xs text-muted">{theme.titleLv}</p>
            <p className="font-medium text-text">{theme.title}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: total ? `${(done / total) * 100}%` : '0%' }}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              {done}/{total} уроков
            </p>
          </div>
        ))}
      </div>

      {byTheme.map(({ theme, items, done, total }) => (
        <div key={theme.id} className="mb-8">
          <div className="mb-4 flex flex-wrap items-baseline gap-2">
            <h2 className="text-lg font-semibold">{theme.title}</h2>
            <span className="text-sm text-muted">
              {theme.description} · {done}/{total}
            </span>
          </div>
          <div className="grid gap-3">
            {items.map((lesson) => {
              const complete = completedLessons.includes(lesson.id)
              return (
                <Link
                  key={lesson.id}
                  to={`/lessons/${lesson.id}`}
                  className="glass card-hover flex items-center gap-4 rounded-2xl p-5 no-underline"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-text">{lesson.title}</h3>
                      <span className={`text-xs font-medium ${levelColors[lesson.level]}`}>
                        {lesson.level}
                      </span>
                      {complete && <CheckCircle size={16} className="text-success" />}
                    </div>
                    <p className="mt-1 text-sm text-muted">{lesson.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted">
                    <Clock size={14} />
                    {lesson.duration} мин
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
