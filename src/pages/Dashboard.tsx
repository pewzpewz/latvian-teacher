import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Brain,
  Flame,
  MessageCircle,
  Mic,
  Sparkles,
  Trophy,
  Target,
  TrendingUp,
  ArrowRight,
  Zap,
  Gamepad2,
  Layers,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { lessons } from '../data/lessons'
import { vocabulary } from '../data/vocabulary'
import { analyzeLearning } from '../lib/adaptive'
import { buildTodayPlan } from '../lib/todayPlan'
import { achievements, getTotalXp } from '../data/achievements'
import { useTranslation } from '../hooks/useTranslation'
import { wordCountLabel, dayCountLabel } from '../i18n/plural'

const todayIcons = {
  srs: Brain,
  lesson: BookOpen,
  dialog: MessageCircle,
  practice: Mic,
  tutor: Sparkles,
  plan: Zap,
} as const

const quickLinkKeys = [
  { to: '/lessons', icon: BookOpen, labelKey: 'dashboard.quickLessons', descKey: 'dashboard.quickLessonsDesc', color: 'text-accent' },
  { to: '/vocabulary', icon: Brain, labelKey: 'dashboard.quickVocabulary', descKey: 'dashboard.quickVocabularyDesc', color: 'text-gold' },
  { to: '/grammar/declensions', icon: Layers, labelKey: 'dashboard.quickDeclensions', descKey: 'dashboard.quickDeclensionsDesc', color: 'text-info' },
  { to: '/grammar/conjugations', icon: Zap, labelKey: 'dashboard.quickConjugations', descKey: 'dashboard.quickConjugationsDesc', color: 'text-info' },
  { to: '/dialogs', icon: MessageCircle, labelKey: 'dashboard.quickDialogs', descKey: 'dashboard.quickDialogsDesc', color: 'text-info' },
  { to: '/training/pronunciation', icon: Mic, labelKey: 'dashboard.quickPractice', descKey: 'dashboard.quickPracticeDesc', color: 'text-success' },
  { to: '/training/games', icon: Gamepad2, labelKey: 'dashboard.quickGames', descKey: 'dashboard.quickGamesDesc', color: 'text-gold' },
  { to: '/tutor', icon: Sparkles, labelKey: 'dashboard.quickTutor', descKey: 'dashboard.quickTutorDesc', color: 'text-accent' },
] as const

const DAILY_GOAL_KEY = 'dashboard.dailyGoal'

export function Dashboard() {
  const { t, lang } = useTranslation()
  const { progress, settings, updateStreak, getDueCards } = useStore()
  const completedCount = progress.completedLessons.length
  const totalLessons = lessons.length
  const progressPercent = Math.round((completedCount / totalLessons) * 100)
  const analysis = useMemo(() => analyzeLearning(progress, t), [progress, t])
  const xp = useMemo(() => getTotalXp(progress.unlockedAchievements), [progress.unlockedAchievements])
  const recentBadges = achievements.filter((a) => progress.unlockedAchievements.includes(a.id)).slice(-4)
  const dueCount = getDueCards().length

  const todayMinutes = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return progress.todayStudyDate === today ? progress.todayStudyMinutes : 0
  }, [progress.todayStudyMinutes, progress.todayStudyDate])

  const dailyPercent = Math.min(100, Math.round((todayMinutes / settings.dailyGoal) * 100))
  const todayPlan = useMemo(
    () => buildTodayPlan(progress, dueCount, { learningGoal: settings.learningGoal, t, lang }),
    [progress, dueCount, settings.learningGoal, t, lang],
  )

  const statCards = useMemo(
    () => [
      {
        icon: Target,
        labelKey: DAILY_GOAL_KEY,
        value: t('common.minutesShort', { current: todayMinutes, goal: settings.dailyGoal }),
        color: 'text-accent',
        sub: dailyPercent >= 100 ? t('dashboard.dailyGoalDone') : `${dailyPercent}%`,
        showProgress: true,
      },
      {
        icon: TrendingUp,
        labelKey: 'dashboard.progress',
        value: `${progressPercent}%`,
        color: 'text-success',
        sub: null,
        showProgress: false,
      },
      {
        icon: Brain,
        labelKey: 'dashboard.wordsLearned',
        value: progress.wordsLearned.toString(),
        color: 'text-gold',
        sub: null,
        showProgress: false,
      },
      {
        icon: Flame,
        labelKey: 'dashboard.streak',
        value: t('dashboard.streakValue', { count: progress.streak, unit: dayCountLabel(lang, progress.streak) }),
        color: 'text-accent',
        sub: null,
        showProgress: false,
      },
    ],
    [t, lang, todayMinutes, settings.dailyGoal, dailyPercent, progressPercent, progress.wordsLearned, progress.streak],
  )

  useEffect(() => {
    updateStreak()
  }, [updateStreak])

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="gradient-text text-3xl font-bold">
          {settings.userName ? t('app.greetingNamed', { name: settings.userName }) : t('app.greetingDefault')}
        </h1>
        <p className="mt-2 text-muted">
          {t('dashboard.yourLevel')} <strong className="text-accent">{analysis.estimatedLevel}</strong>
          {' · '}
          {t('dashboard.mastery')} <strong className="text-success">{analysis.masteryPercent}%</strong>
        </p>
      </motion.div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {statCards.map(({ icon: Icon, labelKey, value, color, sub, showProgress }, i) => (
          <motion.div
            key={labelKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass card-hover rounded-2xl p-4 sm:p-5"
          >
            <Icon size={20} className={`mb-3 ${color}`} />
            <p className="text-xl font-bold sm:text-2xl">{value}</p>
            <p className="text-sm text-muted">{t(labelKey)}</p>
            {sub && <p className="mt-1 text-xs text-success">{sub}</p>}
            {showProgress && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${dailyPercent}%` }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {dueCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-gold/20 bg-gold/5 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-gold">
                {t('dashboard.reviewTodayValue', { count: dueCount, unit: wordCountLabel(lang, dueCount) })}
              </p>
              <p className="text-sm text-muted">{t('dashboard.srsHint')}</p>
            </div>
            <Link
              to="/vocabulary?mode=cards&due=1"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white no-underline hover:opacity-90"
            >
              {t('dashboard.startReview')}
            </Link>
          </div>
        </motion.div>
      )}

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/10 to-gold/5 p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={22} className="text-accent" />
            <h2 className="text-lg font-semibold">{t('today.title')}</h2>
          </div>
          <span className="text-sm text-muted">
            {t('today.minutes', { current: todayMinutes, goal: settings.dailyGoal })}
          </span>
        </div>
        <div className="space-y-2">
          {todayPlan.map((item) => {
            const Icon = todayIcons[item.kind]
            return (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-center gap-4 rounded-xl border border-border/40 bg-surface/60 px-4 py-3 no-underline transition-colors hover:border-accent/40"
              >
                <div className="rounded-lg bg-surface-2 p-2 text-accent">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text">{item.title}</p>
                  <p className="truncate text-xs text-muted">{item.description}</p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-muted" />
              </Link>
            )
          })}
        </div>
      </motion.section>

      {analysis.needsAiRefresh && (
        <div className="mb-8 rounded-2xl border border-gold/30 bg-gold/5 p-5">
          <p className="font-medium text-gold">{t('dashboard.refreshPlanTitle')}</p>
          <p className="mt-1 text-sm text-muted">{t('dashboard.refreshPlanDesc')}</p>
          <Link
            to="/plan?adapt=1"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gold/20 px-4 py-2 text-sm font-medium text-gold no-underline hover:bg-gold/30"
          >
            <Sparkles size={14} />
            {t('dashboard.refreshPlan')}
          </Link>
        </div>
      )}

      <Link
        to="/progress"
        className="mb-8 block rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/5 to-accent/5 p-5 no-underline transition-colors hover:border-gold/40"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy size={22} className="text-gold" />
            <div>
              <p className="font-medium text-text">
                {t('dashboard.achievementsCount', {
                  unlocked: progress.unlockedAchievements.length,
                  total: achievements.length,
                })}
              </p>
              <p className="text-sm text-muted">{t('dashboard.viewProgress', { xp })}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {recentBadges.map((a) => (
              <span key={a.id} className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-lg">
                {a.icon}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <h2 className="mb-4 text-lg font-semibold">{t('dashboard.quickAccess')}</h2>
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {quickLinkKeys.map(({ to, icon: Icon, labelKey, descKey, color }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <Link
              to={to}
              className="glass card-hover flex items-start gap-4 rounded-2xl p-5 no-underline"
            >
              <div className={`rounded-xl bg-surface p-3 ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="font-medium text-text">{t(labelKey)}</p>
                <p className="text-sm text-muted">{t(descKey)}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold">{t('dashboard.continueLearning')}</h3>
          {analysis.actions
            .filter((a) => a.type === 'lesson' || a.type === 'review')
            .slice(0, 3)
            .map((action) => (
              <Link
                key={action.id}
                to={action.link}
                className="mb-2 flex items-center justify-between rounded-xl border border-border p-3 no-underline transition-colors hover:border-accent/30"
              >
                <div>
                  <p className="text-sm font-medium text-text">{action.title}</p>
                  <p className="text-xs text-muted">{action.description}</p>
                </div>
              </Link>
            ))}
          {completedCount === totalLessons && (
            <p className="text-sm text-success">{t('dashboard.allLessonsDone')}</p>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold">{t('dashboard.stats')}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">{t('dashboard.statsLessons')}</span>
              <span>
                {t('dashboard.statsLessonsValue', { done: completedCount, total: totalLessons })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">{t('dashboard.statsVocab')}</span>
              <span>{vocabulary.length + progress.adaptiveWords.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">{t('dashboard.statsAdaptive')}</span>
              <span>{progress.adaptiveExercises.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">{t('dashboard.statsStudyTime')}</span>
              <span>
                {progress.totalStudyMinutes} {t('common.minutes')}
              </span>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-gold transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
