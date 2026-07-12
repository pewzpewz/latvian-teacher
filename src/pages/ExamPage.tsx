import { useState } from 'react'
import { GraduationCap, ChevronRight, ExternalLink, BookOpen, Clock, Flag, Headphones, PenLine, Mic, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  examSections,
  EXAM_OFFICIAL_LINKS,
  type ExamSection,
  type ExamSectionType,
} from '../data/examB1'
import { examA2Sections } from '../data/examA2'
import { ExamExerciseCard } from '../components/ExamExerciseCard'
import { SpeakButton } from '../components/SpeakButton'
import { useStore } from '../store/useStore'
import { LiveExamPanel } from '../components/LiveExamPanel'
import { useSpeech } from '../hooks/useSpeech'
import { useTranslation } from '../hooks/useTranslation'

type ExamLevel = 'A2' | 'B1'

const EXAM_LEVEL_IDS: ExamLevel[] = ['A2', 'B1']

const SECTION_ICONS: Record<ExamSectionType, typeof BookOpen> = {
  reading: BookOpen,
  grammar: GraduationCap,
  listening: Headphones,
  writing: PenLine,
  speaking: Mic,
  'speaking-live': Radio,
}

function sectionsForLevel(level: ExamLevel): ExamSection[] {
  return level === 'A2' ? examA2Sections : examSections
}

export function ExamPage() {
  const { t } = useTranslation()
  const settings = useStore((s) => s.settings)
  const recordExercise = useStore((s) => s.recordExercise)
  const addStudyTime = useStore((s) => s.addStudyTime)
  const { startListening, stopListening, listening, transcript } = useSpeech()

  const [examLevel, setExamLevel] = useState<ExamLevel>('A2')
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [canProceed, setCanProceed] = useState(false)
  const [audioPlays, setAudioPlays] = useState(0)
  const [liveResult, setLiveResult] = useState<{
    completed: boolean
    tasksReached: number
    utteranceCount: number
  } | null>(null)

  const sections = sectionsForLevel(examLevel)
  const section = activeSection ? sections.find((s) => s.id === activeSection) : null
  const question = section?.questions[questionIndex]

  const switchLevel = (level: ExamLevel) => {
    setExamLevel(level)
    setActiveSection(null)
    setFinished(false)
  }

  const startSection = (id: string) => {
    setActiveSection(id)
    setQuestionIndex(0)
    setScore(0)
    setFinished(false)
    setCanProceed(false)
    setAudioPlays(0)
    setLiveResult(null)
  }

  const handleAnswer = (correct: boolean) => {
    if (question) {
      recordExercise(question.id, correct, {
        category: 'exam',
        lessonId: `exam-${examLevel.toLowerCase()}`,
      })
    }
    if (correct) setScore((s) => s + 1)
  }

  const nextQuestion = () => {
    if (!section) return
    setCanProceed(false)
    if (questionIndex + 1 >= section.questions.length) {
      setFinished(true)
    } else {
      setQuestionIndex((i) => i + 1)
    }
  }

  const backToList = () => {
    if (listening) stopListening()
    setActiveSection(null)
    setFinished(false)
    setLiveResult(null)
  }

  const handleAudioPlay = () => {
    setAudioPlays((n) => n + 1)
  }

  if (section?.type === 'speaking-live' && !liveResult) {
    return (
      <div>
        <button type="button" onClick={backToList} className="mb-4 text-sm text-muted hover:text-text">
          {t('exam.backToListLevel', { level: 'B1' })}
        </button>
        <h1 className="gradient-text mb-2 text-2xl font-bold">{section.title}</h1>
        <p className="mb-6 text-sm text-muted">{section.description}</p>
        <LiveExamPanel
          apiKey={settings.aiApiKey || undefined}
          provider={settings.aiProvider}
          model={settings.aiModel}
          voice={settings.ttsVoice}
          speechRate={settings.speechRate}
          userName={settings.userName}
          onStudy={() => addStudyTime(1)}
          onFinish={(result) => {
            const passed = result.completed || result.tasksReached >= 3
            recordExercise('b1-live-speaking', passed, {
              category: 'exam',
              lessonId: 'exam-b1-live',
            })
            addStudyTime(section.timeMinutes)
            setLiveResult(result)
          }}
        />
      </div>
    )
  }

  if (section?.type === 'speaking-live' && liveResult) {
    const passed = liveResult.completed || liveResult.tasksReached >= 3
    return (
      <div className="text-center">
        <button type="button" onClick={backToList} className="mb-6 text-sm text-muted hover:text-text">
          {t('exam.backToList')}
        </button>
        <div className="glass mx-auto max-w-md rounded-2xl p-8">
          <Radio size={48} className="mx-auto mb-4 text-accent" />
          <h2 className="mb-2 text-xl font-bold">{t('exam.liveFinished')}</h2>
          <p className="mb-4 text-2xl font-bold text-accent">
            {t('exam.liveTasks', { reached: liveResult.tasksReached })}
          </p>
          <p className="text-sm text-muted">
            {passed ? t('exam.livePassGood') : t('exam.livePassBad')}
          </p>
          <button
            type="button"
            onClick={() => {
              setLiveResult(null)
            }}
            className="mt-6 rounded-xl bg-accent/15 px-5 py-2 text-sm font-medium text-accent hover:bg-accent/25"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  if (section && question && !finished) {
    return (
      <div>
        <button type="button" onClick={backToList} className="mb-4 text-sm text-muted hover:text-text">
          {t('exam.backToListLevel', { level: examLevel })}
        </button>
        <h1 className="gradient-text mb-2 text-2xl font-bold">{section.title}</h1>
        <p className="mb-2 text-sm text-muted">
          {t('exam.questionOf', { current: questionIndex + 1, total: section.questions.length })}
        </p>

        {section.type === 'listening' && section.audioScript && (
          <div className="glass mb-6 rounded-2xl border-l-4 border-info/50 p-5">
            <p className="mb-3 text-sm text-muted">
              {t('exam.listeningInstruction', { plays: audioPlays })}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <SpeakButton
                text={section.audioScript}
                size="md"
                className="!h-10 !w-auto gap-2 px-4"
              />
              <button
                type="button"
                onClick={handleAudioPlay}
                disabled={audioPlays >= 2}
                className="rounded-lg border border-border px-3 py-2 text-xs hover:border-accent/40 disabled:opacity-40"
              >
                {t('exam.markListening')}
              </button>
              {audioPlays >= 1 && (
                <span className="text-xs text-success">{t('exam.canAnswer')}</span>
              )}
            </div>
          </div>
        )}

        {section.type === 'speaking' && (
          <p className="mb-4 text-sm text-muted">
            {t('exam.speakingInstruction')}{' '}
            <Link to="/tutor" className="text-accent">
              {t('exam.speakingLiveLink')}
            </Link>
            .
          </p>
        )}

        {question.passage && section.type !== 'listening' && (
          <div className="glass mb-6 rounded-2xl border-l-4 border-accent/50 p-5 text-sm leading-relaxed">
            {question.passage}
          </div>
        )}

        <ExamExerciseCard
          key={question.id}
          question={question}
          onComplete={handleAnswer}
          onChecked={() => setCanProceed(true)}
          listening={listening}
          transcript={transcript}
          onStartListen={() => startListening()}
          onStopListen={() => stopListening()}
        />

        <button
          type="button"
          onClick={nextQuestion}
          disabled={!canProceed}
          className="mt-4 rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {questionIndex + 1 >= section.questions.length ? t('common.finishTest') : t('common.nextQuestion')}
        </button>

        {section.type === 'listening' && section.audioScript && canProceed && (
          <details className="mt-6 text-sm text-muted">
            <summary className="cursor-pointer hover:text-text">{t('exam.showTranscript')}</summary>
            <p className="latvian-text mt-2 rounded-xl bg-surface-2 p-4 leading-relaxed">
              {section.audioScript}
            </p>
          </details>
        )}
      </div>
    )
  }

  if (section && finished) {
    const total = section.questions.length
    const pct = Math.round((score / total) * 100)
    const passHint =
      examLevel === 'A2'
        ? pct >= 70
          ? t('exam.passHintA2Good')
          : t('exam.passHintA2Bad')
        : pct >= 70
          ? t('exam.passHintB1Good')
          : t('exam.passHintB1Bad')
    return (
      <div className="text-center">
        <button type="button" onClick={backToList} className="mb-6 text-sm text-muted hover:text-text">
          {t('exam.backToList')}
        </button>
        <div className="glass mx-auto max-w-md rounded-2xl p-8">
          <GraduationCap size={48} className="mx-auto mb-4 text-accent" />
          <h2 className="mb-2 text-xl font-bold">{t('exam.result', { level: examLevel })}</h2>
          <p className="mb-4 text-3xl font-bold text-accent">
            {score}/{total} ({pct}%)
          </p>
          <p className="text-sm text-muted">{passHint}</p>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="exam-page">
      <h1 className="gradient-text mb-2 text-3xl font-bold">{t('exam.title')}</h1>
      <p className="mb-6 text-muted">{t('exam.subtitle')}</p>

      <div className="mb-8 flex flex-wrap gap-2">
        {EXAM_LEVEL_IDS.map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => switchLevel(lvl)}
            className={`rounded-xl px-5 py-3 text-left transition-colors ${
              examLevel === lvl
                ? 'bg-accent text-white'
                : 'glass border border-border hover:border-accent/40'
            }`}
            data-testid={`exam-level-${lvl}`}
          >
            <span className="block font-semibold">{lvl}</span>
            <span
              className={`mt-0.5 block text-xs ${examLevel === lvl ? 'text-white/80' : 'text-muted'}`}
            >
              {t(`levels.exam${lvl}_desc`)}
            </span>
          </button>
        ))}
      </div>

      <Link
        to="/naturalization"
        className="glass card-hover mb-8 flex items-center gap-4 rounded-2xl p-5 no-underline"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
          <Flag size={22} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-text">{t('exam.naturalizationCard')}</h3>
          <p className="mt-1 text-sm text-muted">{t('exam.naturalizationCardDesc')}</p>
        </div>
        <ChevronRight size={18} className="text-muted" />
      </Link>

      <div className="mb-8 grid gap-3">
        {sections.map((s) => {
          const Icon = SECTION_ICONS[s.type]
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => startSection(s.id)}
              className="glass card-hover flex items-center gap-4 rounded-2xl p-5 text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.description}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <Clock size={12} />
                  {t('common.timeApprox', { minutes: s.timeMinutes })}
                {s.questions.length > 0
                  ? ` · ${t('common.questionsCount', { count: s.questions.length })}`
                  : ` · ${t('common.live')}`}
                </p>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </button>
          )
        })}
      </div>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">{t('exam.officialLva')}</h2>
        <ul className="space-y-3">
          {EXAM_OFFICIAL_LINKS.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2 text-accent no-underline hover:underline"
              >
                <ExternalLink size={16} className="mt-0.5 shrink-0" />
                <span>
                  <strong>{link.title}</strong>
                  <span className="mt-0.5 block text-sm text-muted">{link.description}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
