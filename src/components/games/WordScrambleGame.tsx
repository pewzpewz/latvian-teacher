import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Trophy } from 'lucide-react'
import { pickRandomWords } from '../../data/games'
import { matchesLatvian, scrambleWord } from '../../lib/gameUtils'

import { useTranslation } from '../../hooks/useTranslation'

type Props = {
  onFinish: (score: number, correct: number, total: number) => void
  onRestart?: () => void
}

const ROUND_SIZE = 10

export function WordScrambleGame({ onFinish, onRestart }: Props) {
  const { t } = useTranslation()
  const [words] = useState(() => pickRandomWords(ROUND_SIZE, true))
  const [index, setIndex] = useState(0)
  const [letters, setLetters] = useState<string[]>([])
  const [picked, setPicked] = useState<string[]>([])
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)
  const [flash, setFlash] = useState<'ok' | 'err' | null>(null)

  const current = words[index]

  const setupRound = useCallback((word: string) => {
    setLetters(scrambleWord(word))
    setPicked([])
  }, [])

  useEffect(() => {
    if (current) setupRound(current.lv)
  }, [current, setupRound])

  const checkAnswer = (answer: string) => {
    const ok = matchesLatvian(answer, current.lv)
    setFlash(ok ? 'ok' : 'err')
    setTimeout(() => setFlash(null), 400)

    if (ok) setCorrect((c) => c + 1)

    setTimeout(() => {
      const next = index + 1
      if (next >= words.length) {
        setFinished(true)
        onFinish(correct + (ok ? 1 : 0) * 50, correct + (ok ? 1 : 0), words.length)
      } else {
        setIndex(next)
      }
    }, ok ? 600 : 900)
  }

  const pickLetter = (i: number) => {
    if (flash) return
    const letter = letters[i]
    if (!letter) return
    const newLetters = [...letters]
    newLetters[i] = ''
    setLetters(newLetters)
    const newPicked = [...picked, letter]
    setPicked(newPicked)

    if (newPicked.length === current.lv.length) {
      checkAnswer(newPicked.join(''))
    }
  }

  const resetPick = () => {
    if (flash) return
    setupRound(current.lv)
  }

  if (finished) {
    const score = correct * 50
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <Trophy size={48} className="mx-auto mb-4 text-gold" />
        <h2 className="text-2xl font-bold">{t('games.scrambleFinished')}</h2>
        <p className="mt-2 text-muted">{t('games.scrambleCorrect', { correct, total: words.length })}</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-2xl font-bold text-success">{score}</p>
            <p className="text-xs text-muted">{t('common.score')}</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-2xl font-bold text-accent">{Math.round((correct / words.length) * 100)}%</p>
            <p className="text-xs text-muted">{t('common.accuracy')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 flex items-center gap-2 rounded-xl bg-success px-6 py-3 text-sm font-medium text-bg mx-auto"
        >
          <RotateCcw size={16} /> {t('games.scrambleRetry')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted">
        <span>{t('games.scrambleRounds', { current: index + 1, total: words.length })}</span>
        <span>{t('games.scrambleCorrectCount', { count: correct })}</span>
      </div>

      <div
        className={`glass rounded-2xl p-6 transition-colors ${
          flash === 'ok' ? 'border-success/50 bg-success/5' : flash === 'err' ? 'border-red-400/50 bg-red-400/5' : ''
        }`}
      >
        <p className="text-center text-sm text-muted">{t('games.scrambleMeaning')}</p>
        <p className="mt-2 text-center text-2xl font-bold">{current.ru}</p>
        {current.hint && <p className="mt-1 text-center text-xs text-muted">{current.hint}</p>}

        {/* Собранное слово */}
        <div className="mt-6 flex min-h-[3rem] flex-wrap justify-center gap-2">
          {picked.map((l, i) => (
            <motion.span
              key={`${i}-${l}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="latvian-text flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-lg font-bold text-accent"
            >
              {l}
            </motion.span>
          ))}
          {picked.length === 0 && (
            <span className="text-muted text-sm">{t('games.scrambleClickLetters')}</span>
          )}
        </div>

        {/* Буквы */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {letters.map((l, i) =>
            l ? (
              <motion.button
                key={`${i}-${l}`}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => pickLetter(i)}
                className="latvian-text flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-2 text-xl font-bold hover:border-accent/40 hover:bg-accent/10"
              >
                {l}
              </motion.button>
            ) : null,
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={resetPick}
            className="flex-1 rounded-xl border border-border py-2 text-sm text-muted hover:bg-surface-2"
          >
            {t('games.scrambleClear')}
          </button>
          <button
            type="button"
            onClick={() => checkAnswer(picked.join(''))}
            disabled={picked.length === 0}
            className="flex-1 rounded-xl bg-success py-2 text-sm font-medium text-bg disabled:opacity-40"
          >
            {t('games.scrambleCheck')}
          </button>
        </div>
      </div>
    </div>
  )
}
