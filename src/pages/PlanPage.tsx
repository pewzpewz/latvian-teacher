import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { analyzeLearning, buildProfileSummary } from '../lib/adaptive'
import { generateAdaptiveContent } from '../lib/api'
import { ExerciseCard } from '../components/ExerciseCard'
import { vocabulary } from '../data/vocabulary'
import { useTranslation } from '../hooks/useTranslation'

const actionIcons = {
  lesson: Target,
  vocabulary: Brain,
  practice: Zap,
  dialog: Sparkles,
  review: RefreshCw,
  adaptive: Sparkles,
}

export function PlanPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { progress, settings, addAdaptiveContent, recordExercise } = useStore()
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [genTip, setGenTip] = useState('')
  const [exerciseIdx, setExerciseIdx] = useState(0)
  const [canProceed, setCanProceed] = useState(false)

  const analysis = analyzeLearning(progress, t)
  const pendingExercises = progress.adaptiveExercises.filter((e) => !progress.exerciseScores[e.id])

  useEffect(() => {
    setCanProceed(false)
  }, [exerciseIdx])

  const generateContent = async () => {
    setGenerating(true)
    setGenError('')
    try {
      const result = await generateAdaptiveContent(buildProfileSummary(progress, settings), {
        apiKey: settings.aiApiKey || undefined,
        provider: settings.aiProvider,
        model: settings.aiModel,
      })

      const words = result.words.map((w, i) => ({
        id: `aw-${Date.now()}-${i}`,
        lv: w.lv,
        ru: w.ru,
        category: w.category,
        reason: w.reason,
        createdAt: Date.now(),
      }))

      const exercises = result.exercises.map((e) => ({
        ...e,
        createdAt: Date.now(),
      }))

      addAdaptiveContent(words, exercises)
      setGenTip(result.tip)
    } catch (e) {
      setGenError(e instanceof Error ? e.message : t('common.generationError'))
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    if (searchParams.get('adapt') !== '1' || generating) return
    if (!analysis.needsAiRefresh && progress.adaptiveExercises.length > 0) return
    const ok = window.confirm(t('plan.adaptConfirm'))
    if (ok) void generateContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('adapt')])

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="gradient-text text-3xl font-bold">{t('plan.title')}</h1>
          <p className="mt-2 text-muted">{t('plan.subtitle')}</p>
        </div>
        <div className="rounded-full bg-accent/15 px-4 py-2 text-sm font-medium text-accent">
          {t('common.levelShort', { level: analysis.estimatedLevel })}
        </div>
      </div>

      {/* Mastery overview */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5">
          <TrendingUp size={20} className="mb-2 text-success" />
          <p className="text-2xl font-bold">{analysis.masteryPercent}%</p>
          <p className="text-sm text-muted">{t('plan.mastery')}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <AlertTriangle size={20} className="mb-2 text-gold" />
          <p className="text-2xl font-bold">{analysis.weakAreas.length}</p>
          <p className="text-sm text-muted">{t('plan.weakAreas')}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <Sparkles size={20} className="mb-2 text-accent" />
          <p className="text-2xl font-bold">{progress.adaptiveExercises.length}</p>
          <p className="text-sm text-muted">{t('plan.adaptiveTasks')}</p>
        </div>
      </div>

      {/* Today's plan */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">{t('plan.recommendationsToday')}</h2>
        <div className="space-y-3">
          {analysis.actions.map((action, i) => {
            const Icon = actionIcons[action.type]
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={action.link}
                  className="glass card-hover flex items-center gap-4 rounded-2xl p-5 no-underline"
                >
                  <div className="rounded-xl bg-surface-2 p-3 text-accent">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text">{action.title}</p>
                    <p className="text-sm text-muted">{action.description}</p>
                    <p className="mt-1 text-xs text-gold">{action.reason}</p>
                  </div>
                  <ArrowRight size={18} className="text-muted" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Skill map */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">{t('plan.skillMap')}</h2>
        {analysis.weakSkills.length === 0 && analysis.weakPhonemes.length === 0 ? (
          <p className="text-sm text-muted">{t('plan.skillMapEmpty')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 font-semibold text-gold">{t('plan.weakSkills')}</h3>
              {analysis.weakSkills.length === 0 ? (
                <p className="text-sm text-muted">{t('plan.strongTopicsEmpty')}</p>
              ) : (
                analysis.weakSkills.map((skill) => (
                  <div key={skill.skillId} className="mb-3">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{skill.label}</span>
                      <span className="text-gold">{skill.confidence}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-gold transition-all"
                        style={{ width: `${skill.confidence}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 font-semibold text-accent">{t('plan.weakPhonemes')}</h3>
              {analysis.weakPhonemes.length === 0 ? (
                <p className="text-sm text-muted">{t('plan.strongTopicsEmpty')}</p>
              ) : (
                analysis.weakPhonemes.map((skill) => (
                  <div key={skill.skillId} className="mb-3">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{skill.label}</span>
                      <span className="text-accent">{skill.confidence}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${skill.confidence}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* Weak / Strong areas */}
      <div className="mb-8 grid grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold text-gold">{t('plan.weakTopics')}</h3>
          {analysis.weakAreas.length === 0 ? (
            <p className="text-sm text-muted">{t('plan.weakTopicsEmpty')}</p>
          ) : (
            analysis.weakAreas.map((area) => (
              <div key={area.name} className="mb-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span>{area.name}</span>
                  <span className="text-gold">{area.score}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-gold transition-all"
                    style={{ width: `${area.score}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold text-success">{t('plan.strongTopics')}</h3>
          {analysis.strongAreas.length === 0 ? (
            <p className="text-sm text-muted">{t('plan.strongTopicsEmpty')}</p>
          ) : (
            analysis.strongAreas.map((area) => (
              <div key={area.name} className="mb-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span>{area.name}</span>
                  <span className="text-success">{area.score}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{ width: `${area.score}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI-generated content */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('plan.personalContent')}</h2>
          <button
            type="button"
            onClick={generateContent}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {generating ? t('plan.generating') : t('plan.generate')}
          </button>
        </div>

        {genError && (
          <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{genError}</div>
        )}
        {genTip && (
          <div className="mb-4 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm">
            <span className="font-medium text-gold">{t('plan.aiTip')} </span>{genTip}
          </div>
        )}

        {analysis.needsAiRefresh && !generating && (
          <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-muted">
            {t('plan.needsRefresh')}
          </div>
        )}

        {/* Adaptive words */}
        {progress.adaptiveWords.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-muted">
              {t('plan.addedWords', { count: progress.adaptiveWords.length })}
            </h3>
            <div className="grid gap-2">
              {progress.adaptiveWords.slice(-8).map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-2"
                >
                  <div>
                    <span className="latvian-text font-medium text-accent">{w.lv}</span>
                    <span className="mx-2 text-muted">—</span>
                    <span>{w.ru}</span>
                  </div>
                  <span className="text-xs text-gold">{w.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adaptive exercises */}
        {pendingExercises.length > 0 ? (
          <div>
            <p className="mb-4 text-sm text-muted">
              {t('common.taskOf', { current: exerciseIdx + 1, total: pendingExercises.length })}
            </p>
            <ExerciseCard
              key={pendingExercises[exerciseIdx].id}
              exercise={pendingExercises[exerciseIdx]}
              onComplete={(correct) => {
                recordExercise(pendingExercises[exerciseIdx].id, correct, {
                  category: pendingExercises[exerciseIdx].topic,
                })
              }}
              onChecked={() => setCanProceed(true)}
            />
            {!canProceed && (
              <p className="mt-3 text-sm text-muted">{t('common.checkFirstShort')}</p>
            )}
            {exerciseIdx < pendingExercises.length - 1 && (
              <button
                type="button"
                onClick={() => setExerciseIdx((i) => i + 1)}
                disabled={!canProceed}
                className="mt-4 rounded-xl bg-accent px-6 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('common.nextAlt')}
              </button>
            )}
            {exerciseIdx === pendingExercises.length - 1 && canProceed && (
              <p className="mt-4 text-sm text-success">{t('plan.lastTaskDone')}</p>
            )}
          </div>
        ) : progress.adaptiveExercises.length > 0 ? (
          <p className="text-sm text-success">{t('plan.allTasksDone')}</p>
        ) : (
          <p className="text-sm text-muted">{t('plan.tasksPending')}</p>
        )}
      </section>

      {/* Words to review */}
      {analysis.wordsToReview.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t('plan.wordsToReview')}</h2>
          <div className="grid gap-2">
            {analysis.wordsToReview.map((id) => {
              const w = vocabulary.find((v) => v.id === id)
              if (!w) return null
              return (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3"
                >
                  <span className="latvian-text font-medium text-accent">{w.lv}</span>
                  <span className="text-muted">{w.ru}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
