import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Trophy } from 'lucide-react'
import { pickRandomWords } from '../../data/games'
import { formatTime, matchesLatvian } from '../../lib/gameUtils'

import { useTranslation } from '../../hooks/useTranslation'

type Props = {
  onFinish: (score: number, correct: number, total: number) => void
  onRestart?: () => void
}

const GAME_DURATION = 60

export function LaivaRaceGame({ onFinish, onRestart }: Props) {
  const { t } = useTranslation()
  const [words] = useState(() => pickRandomWords(30, true))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [distance, setDistance] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [flash, setFlash] = useState<'ok' | 'err' | null>(null)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const finishedRef = useRef(false)

  const current = words[index % words.length]

  const endGame = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setFinished(true)
    onFinish(distance, correct, index)
  }, [correct, distance, index, onFinish])

  useEffect(() => {
    if (finished) return
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t)
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [finished, endGame])

  useEffect(() => {
    inputRef.current?.focus()
  }, [index, finished])

  const submit = () => {
    if (finished || !input.trim()) return
    const ok = matchesLatvian(input, current.lv)
    setFlash(ok ? 'ok' : 'err')
    setTimeout(() => setFlash(null), 300)

    if (ok) {
      const bonus = Math.max(10, 30 - current.lv.length)
      setDistance((d) => d + bonus)
      setCorrect((c) => c + 1)
    } else {
      setDistance((d) => Math.max(0, d - 5))
    }
    setInput('')
    setIndex((i) => i + 1)
  }

  const progress = Math.min(100, (distance / 500) * 100)

  if (finished) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <Trophy size={48} className="mx-auto mb-4 text-gold" />
        <h2 className="text-2xl font-bold">{t('common.finish')}</h2>
        <p className="mt-2 text-muted">{t('games.laivaFinished', { distance })}</p>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-2xl font-bold text-info">{distance} m</p>
            <p className="text-xs text-muted">{t('common.distance')}</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-2xl font-bold text-success">{correct}</p>
            <p className="text-xs text-muted">{t('exercise.correct')}</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-2xl font-bold text-gold">{formatTime(GAME_DURATION - timeLeft)}</p>
            <p className="text-xs text-muted">{t('common.time')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white mx-auto"
        >
          <RotateCcw size={16} /> {t('common.retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Сцена: река Дaugava */}
      <div className="relative h-48 overflow-hidden rounded-2xl border border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2840] via-[#2a4a6a] to-[#1e3d5c]" />
        {/* Силуэт Риги */}
        <div className="absolute right-4 top-6 opacity-40">
          <div className="flex flex-col items-center gap-1">
            <div className="h-16 w-8 rounded-t-full bg-gold/60" />
            <div className="flex gap-1">
              <div className="h-8 w-6 bg-surface-2/80" />
              <div className="h-10 w-8 bg-surface-2/80" />
              <div className="h-7 w-5 bg-surface-2/80" />
            </div>
          </div>
          <p className="mt-1 text-center text-[10px] text-gold/80">Rīga</p>
        </div>
        {/* Волны */}
        <div className="absolute bottom-0 left-0 right-0 h-20">
          <motion.div
            animate={{ x: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute bottom-0 h-12 w-[200%] bg-info/20"
            style={{ borderRadius: '50% 50% 0 0' }}
          />
          <motion.div
            animate={{ x: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="absolute bottom-2 h-8 w-[200%] bg-info/15"
            style={{ borderRadius: '50% 50% 0 0' }}
          />
        </div>
        {/* Лодка */}
        <motion.div
          className="absolute bottom-14 z-10 text-4xl drop-shadow-lg"
          animate={{ left: `${8 + progress * 0.75}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        >
          ⛵
        </motion.div>
        {/* Прогресс */}
        <div className="absolute bottom-2 left-4 right-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface/50">
            <motion.div
              className="h-full bg-info"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <p className="mt-1 text-xs text-white/70">{t('games.laivaDistance', { distance })}</p>
        </div>
      </div>

      {/* HUD */}
      <div className="flex items-center justify-between text-sm">
        <span className="rounded-lg bg-surface-2 px-3 py-1 font-mono text-info">{formatTime(timeLeft)}</span>
        <span className="text-muted">{t('common.wordsCount', { count: correct })}</span>
        <span className="rounded-lg bg-accent/15 px-3 py-1 text-accent">{Math.round(progress)}%</span>
      </div>

      {/* Задание */}
      <div
        className={`glass rounded-2xl p-6 transition-colors ${
          flash === 'ok' ? 'border-success/50 bg-success/5' : flash === 'err' ? 'border-red-400/50 bg-red-400/5' : ''
        }`}
      >
        <p className="text-sm text-muted">{t('games.laivaTranslation')} <strong className="text-text">{current.ru}</strong></p>
        {current.hint && <p className="mt-1 text-xs text-muted/70">{current.hint}</p>}
        <p className="latvian-text mt-4 text-center text-3xl font-bold tracking-wide">{t('games.laivaLettersCount', { count: current.lv.length })}</p>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={t('common.formPlaceholderLv')}
          className="mt-4 w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-lg outline-none focus:border-info"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={submit}
          className="mt-3 w-full rounded-xl bg-info py-2.5 text-sm font-medium text-white hover:bg-info/90"
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  )
}
