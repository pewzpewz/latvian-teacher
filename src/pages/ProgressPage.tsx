import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Star, Trophy, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'
import {
  achievements,
  milestones,
  CATEGORY_LABELS,
  getTotalXp,
  type Achievement,
} from '../data/achievements'
import { lessons } from '../data/lessons'
import { AchievementCard, MilestoneNode, ProgressRing } from '../components/ProgressWidgets'
import { RetentionAnalyticsCard } from '../components/RetentionAnalyticsCard'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

export function ProgressPage() {
  const progress = useStore((s) => s.progress)
  const unlocked = progress.unlockedAchievements
  const [filter, setFilter] = useState<Achievement['category'] | 'all'>('all')

  const xp = useMemo(() => getTotalXp(unlocked), [unlocked])
  const unlockedCount = unlocked.length
  const totalAchievements = achievements.length

  const filteredAchievements = useMemo(
    () => (filter === 'all' ? achievements : achievements.filter((a) => a.category === filter)),
    [filter],
  )

  const categories: Array<Achievement['category'] | 'all'> = [
    'all',
    ...(Object.keys(CATEGORY_LABELS) as Achievement['category'][]),
  ]

  return (
    <div className="pb-12">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-10 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface-2 to-surface p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Trophy size={22} className="text-gold" />
              <span className="text-sm font-medium text-gold">Tavs progress</span>
            </div>
            <h1 className="gradient-text text-4xl font-bold">Достижения</h1>
            <p className="mt-2 text-muted">
              Уровень <strong className="text-accent">{progress.estimatedLevel}</strong>
              {' · '}
              {unlockedCount} из {totalAchievements} наград
              {' · '}
              <span className="text-gold">{xp} XP</span>
            </p>
          </div>

          <motion.div
            className="hidden items-center gap-6 md:flex"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center">
              <motion.div
                className="text-4xl font-bold text-gold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {unlockedCount}
              </motion.div>
              <div className="text-xs text-muted">открыто</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-4xl font-bold text-accent">{progress.streak}</div>
              <div className="text-xs text-muted">дней 🔥</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Progress rings */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mb-10 grid grid-cols-2 gap-6 md:grid-cols-4"
      >
        <div className="glass flex justify-center rounded-2xl py-6">
          <ProgressRing
            value={progress.completedLessons.length}
            max={lessons.length}
            label="Уроки"
            sublabel="пройдено"
            color="#c41e3a"
            delay={0}
          />
        </div>
        <div className="glass flex justify-center rounded-2xl py-6">
          <ProgressRing
            value={progress.wordsLearned}
            max={500}
            label="Слова"
            sublabel="выучено"
            color="#d4a853"
            delay={0.1}
          />
        </div>
        <div className="glass flex justify-center rounded-2xl py-6">
          <ProgressRing
            value={Object.keys(progress.exerciseScores).length}
            max={30}
            label="Упражнения"
            sublabel="выполнено"
            color="#3ecf8e"
            delay={0.2}
          />
        </div>
        <div className="glass flex justify-center rounded-2xl py-6">
          <ProgressRing
            value={unlockedCount}
            max={totalAchievements}
            label="Награды"
            sublabel="получено"
            color="#9b8cff"
            delay={0.3}
          />
        </div>
      </motion.div>

      <RetentionAnalyticsCard progress={progress} />

      {/* Milestones timeline */}
      <section className="mb-12">
        <div className="mb-6 flex items-center gap-2">
          <Star size={20} className="text-gold" />
          <h2 className="text-xl font-semibold">Вехи пути</h2>
        </div>
        <div className="glass rounded-3xl p-8">
          {milestones.map((m, i) => {
            const current = m.getValue(progress)
            const reached = current >= m.target
            return (
              <MilestoneNode
                key={m.id}
                title={m.title}
                subtitle={m.subtitle}
                icon={m.icon}
                current={current}
                target={m.target}
                unit={m.unit}
                reached={reached}
                isLast={i === milestones.length - 1}
                index={i}
              />
            )
          })}
        </div>
      </section>

      {/* Achievements grid */}
      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-accent" />
            <h2 className="text-xl font-semibold">Achievements</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  filter === cat
                    ? 'bg-accent text-white'
                    : 'border border-border text-muted hover:text-text'
                }`}
              >
                {cat === 'all' ? 'Все' : CATEGORY_LABELS[cat as Achievement['category']]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {filteredAchievements.map((a, i) => (
            <AchievementCard
              key={a.id}
              achievement={a}
              unlocked={unlocked.includes(a.id)}
              progress={progress}
              index={i}
            />
          ))}
        </div>

        {unlockedCount === totalAchievements && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 to-accent/10 p-8 text-center"
          >
            <div className="mb-2 text-5xl">👑</div>
            <h3 className="text-xl font-bold text-gold">Tu esi čempions!</h3>
            <p className="mt-2 text-muted">Все достижения получены — невероятная работа!</p>
          </motion.div>
        )}
      </section>

      {/* XP bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10 glass rounded-2xl p-6"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-gold" />
            <span className="font-medium">Общий опыт</span>
          </div>
          <span className="text-gold font-bold">{xp} XP</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent via-gold to-success"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (xp / 500) * 100)}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">500 XP — максимальный ранг «Latviešu meistars»</p>
      </motion.div>
    </div>
  )
}
