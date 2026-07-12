import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Trophy } from 'lucide-react'
import { pickRandomWords } from '../../data/games'
import { formatTime, shuffle } from '../../lib/gameUtils'

type Props = {
  onFinish: (score: number, correct: number, total: number) => void
  onRestart?: () => void
}

type Card = {
  id: string
  text: string
  pairId: string
  lang: 'lv' | 'ru'
}

export function WordMatchGame({ onFinish, onRestart }: Props) {
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<string[]>([])
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [finished, setFinished] = useState(false)
  const [lock, setLock] = useState(false)

  useEffect(() => {
    const words = pickRandomWords(6, true)
    const deck: Card[] = []
    words.forEach((w, i) => {
      const pid = `p${i}`
      deck.push({ id: `${pid}-lv`, text: w.lv, pairId: pid, lang: 'lv' })
      deck.push({ id: `${pid}-ru`, text: w.ru, pairId: pid, lang: 'ru' })
    })
    setCards(shuffle(deck))
  }, [])

  useEffect(() => {
    if (finished || cards.length === 0) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [finished, cards.length])

  useEffect(() => {
    if (flipped.length !== 2) return
    setLock(true)
    setMoves((m) => m + 1)

    const [a, b] = flipped
    const cardA = cards.find((c) => c.id === a)!
    const cardB = cards.find((c) => c.id === b)!
    const isMatch = cardA.pairId === cardB.pairId && cardA.lang !== cardB.lang

    if (isMatch) {
      const next = new Set(matched)
      next.add(cardA.pairId)
      setMatched(next)
      setFlipped([])
      setLock(false)

      if (next.size === 6) {
        setFinished(true)
        const score = Math.max(100, 600 - moves * 15 - seconds * 2)
        onFinish(score, 6, 6)
      }
    } else {
      setTimeout(() => {
        setFlipped([])
        setLock(false)
      }, 800)
    }
  }, [flipped, cards, matched, moves, seconds, onFinish])

  const flip = (id: string) => {
    if (lock || finished) return
    const card = cards.find((c) => c.id === id)
    if (!card || matched.has(card.pairId) || flipped.includes(id)) return
    if (flipped.length >= 2) return
    setFlipped([...flipped, id])
  }

  if (finished) {
    const score = Math.max(100, 600 - moves * 15 - seconds * 2)
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <Trophy size={48} className="mx-auto mb-4 text-gold" />
        <h2 className="text-2xl font-bold">Visas pāris atrasti!</h2>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-2xl font-bold text-accent">{score}</p>
            <p className="text-xs text-muted">Очки</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-2xl font-bold text-info">{moves}</p>
            <p className="text-xs text-muted">Ходов</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-2xl font-bold text-gold">{formatTime(seconds)}</p>
            <p className="text-xs text-muted">Время</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white mx-auto"
        >
          <RotateCcw size={16} /> Jauna spēle
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted">
        <span>Ходов: {moves}</span>
        <span>{formatTime(seconds)}</span>
        <span>Пар: {matched.size}/6</span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched.has(card.pairId)
          return (
            <motion.button
              key={card.id}
              type="button"
              onClick={() => flip(card.id)}
              whileTap={{ scale: 0.95 }}
              className={`relative aspect-[4/3] rounded-xl border text-sm font-medium transition-colors ${
                matched.has(card.pairId)
                  ? 'border-success/40 bg-success/10 text-success'
                  : isFlipped
                    ? card.lang === 'lv'
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-info/40 bg-info/10 text-info'
                    : 'border-border bg-surface-2 hover:border-accent/30'
              }`}
            >
              {isFlipped ? (
                <span className={card.lang === 'lv' ? 'latvian-text font-bold' : ''}>{card.text}</span>
              ) : (
                <span className="text-2xl">{card.lang === 'lv' ? '🇱🇻' : '🇷🇺'}</span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
