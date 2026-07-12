import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Trophy } from 'lucide-react'
import { latvianLetters } from '../../data/games'
import { shuffle } from '../../lib/gameUtils'

type Props = {
  onFinish: (score: number, correct: number, total: number) => void
  onRestart?: () => void
}

const MAX_MISSES = 5
const LETTER_TIME = 2.8

export function LigoFireGame({ onFinish, onRestart }: Props) {
  const [queue] = useState(() => shuffle([...latvianLetters]))
  const [index, setIndex] = useState(0)
  const [fire, setFire] = useState(50)
  const [streak, setStreak] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [misses, setMisses] = useState(0)
  const [timer, setTimer] = useState(LETTER_TIME)
  const [finished, setFinished] = useState(false)
  const [lastKey, setLastKey] = useState<string | null>(null)
  const finishedRef = useRef(false)

  const current = queue[index % queue.length]

  const endGame = useCallback(
    (finalCorrect: number, finalStreak: number) => {
      if (finishedRef.current) return
      finishedRef.current = true
      setFinished(true)
      const score = finalCorrect * 10 + finalStreak * 5 + Math.round(fire)
      onFinish(score, finalCorrect, index)
    },
    [fire, index, onFinish],
  )

  useEffect(() => {
    if (finished) return
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 0.05) {
          setMisses((m) => {
            const next = m + 1
            if (next >= MAX_MISSES) {
              endGame(correct, streak)
            }
            return next
          })
          setFire((f) => Math.max(0, f - 15))
          setStreak(0)
          setIndex((i) => i + 1)
          return LETTER_TIME
        }
        return t - 0.05
      })
    }, 50)
    return () => clearInterval(interval)
  }, [finished, correct, streak, endGame])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (finished) return
      const key = e.key.length === 1 ? e.key : null
      if (!key) return

      setLastKey(key)
      setTimeout(() => setLastKey(null), 200)

      if (key.toLowerCase() === current.toLowerCase()) {
        setCorrect((c) => c + 1)
        setStreak((s) => s + 1)
        setFire((f) => Math.min(100, f + 12))
        setIndex((i) => {
          const next = i + 1
          if (next >= 25) endGame(correct + 1, streak + 1)
          return next
        })
        setTimer(LETTER_TIME)
      } else {
        setMisses((m) => {
          const next = m + 1
          if (next >= MAX_MISSES) endGame(correct, 0)
          return next
        })
        setFire((f) => Math.max(0, f - 10))
        setStreak(0)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [current, finished, correct, streak, endGame])

  const fireScale = 0.6 + (fire / 100) * 0.8
  const fireOpacity = 0.4 + (fire / 100) * 0.6

  if (finished) {
    const score = correct * 10 + streak * 5
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <Trophy size={48} className="mx-auto mb-4 text-gold" />
        <h2 className="text-2xl font-bold">Līgo vakars beidzās!</h2>
        <p className="mt-2 text-muted">Jūsu uguns nodega pēc {correct} burtiem</p>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-2xl font-bold text-gold">{score}</p>
            <p className="text-xs text-muted">Очки</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-2xl font-bold text-success">{correct}</p>
            <p className="text-xs text-muted">Букв</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-2xl font-bold text-accent">{streak}</p>
            <p className="text-xs text-muted">Серия</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-medium text-bg mx-auto"
        >
          <RotateCcw size={16} /> Vēlreiz
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Сцена Līgo */}
      <div className="relative flex h-56 flex-col items-center justify-end overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-[#0a1628] via-[#1a2a1a] to-[#0d1a0d]">
        {/* Звёзды */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/40"
            style={{ left: `${10 + i * 7}%`, top: `${8 + (i % 3) * 6}%` }}
          />
        ))}
        {/* Венок Līgo */}
        <div className="absolute top-4 text-2xl">🌿 Līgo 🌿</div>

        {/* Костёр */}
        <motion.div
          className="relative mb-8"
          animate={{ scale: fireScale }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <motion.div
            className="text-6xl"
            animate={{ opacity: fireOpacity, y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
          >
            🔥
          </motion.div>
          <motion.div
            className="absolute -inset-4 rounded-full bg-orange-500/20 blur-xl"
            animate={{ opacity: fireOpacity, scale: fireScale }}
          />
        </motion.div>

        {/* Трава */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-green-900/60 to-transparent" />
      </div>

      {/* HUD */}
      <div className="flex justify-between text-sm">
        <span>🔥 {Math.round(fire)}%</span>
        <span className="text-gold">Sērija: {streak}</span>
        <span className="text-muted">❌ {misses}/{MAX_MISSES}</span>
      </div>

      {/* Буква */}
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-sm text-muted">Nospiediet burtu uz klaviatūras:</p>
        <motion.p
          key={current}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`latvian-text mt-4 text-7xl font-bold ${
            lastKey?.toLowerCase() === current.toLowerCase() ? 'text-success' : 'text-gold'
          }`}
        >
          {current}
        </motion.p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full bg-gold"
            animate={{ width: `${(timer / LETTER_TIME) * 100}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
        <p className="mt-4 text-xs text-muted">
          {correct}/25 burti · Ātrāk rakstiet — uguns deg spilgtāk!
        </p>
      </div>
    </div>
  )
}
