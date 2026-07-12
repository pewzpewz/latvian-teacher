import { motion } from 'framer-motion'
import { RotateCcw, Check, X } from 'lucide-react'
import { useState } from 'react'
import type { VocabWord } from '../data/vocabulary'
import { SpeakButton } from './SpeakButton'

type Props = {
  word: VocabWord
  onRate: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void
}

export function FlashCard({ word, onRate }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [showRating, setShowRating] = useState(false)

  const handleFlip = () => {
    if (!flipped) {
      setFlipped(true)
      setShowRating(true)
    }
  }

  const handleRate = (q: 0 | 1 | 2 | 3 | 4 | 5) => {
    onRate(q)
    setFlipped(false)
    setShowRating(false)
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <motion.div
        className="relative h-64 cursor-pointer"
        onClick={handleFlip}
        style={{ perspective: 1000 }}
      >
        <motion.div
          className="absolute inset-0 rounded-2xl border border-border bg-surface-2 p-8"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
        >
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="mb-2 text-xs uppercase tracking-wider text-muted">{word.category}</span>
            <p className="latvian-text text-3xl font-semibold text-accent">{word.lv}</p>
            <div className="mt-4">
              <SpeakButton text={word.lv} />
            </div>
            <p className="mt-6 text-sm text-muted">Нажмите, чтобы перевернуть</p>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-2xl border border-border bg-surface-2 p-8"
          initial={{ rotateY: 180 }}
          animate={{ rotateY: flipped ? 0 : 180 }}
          transition={{ duration: 0.4 }}
          style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
        >
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-2xl font-medium">{word.ru}</p>
            {word.example && (
              <div className="mt-4 space-y-1 text-sm text-muted">
                <p className="latvian-text italic">{word.example}</p>
                <p>{word.exampleRu}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {showRating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex justify-center gap-3"
        >
          <button
            type="button"
            onClick={() => handleRate(1)}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-red-500/50 hover:bg-red-500/10"
          >
            <X size={16} className="text-red-400" />
            Не помню
          </button>
          <button
            type="button"
            onClick={() => handleRate(3)}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-gold/50 hover:bg-gold/10"
          >
            <RotateCcw size={16} className="text-gold" />
            Сложно
          </button>
          <button
            type="button"
            onClick={() => handleRate(5)}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:border-success/50 hover:bg-success/10"
          >
            <Check size={16} className="text-success" />
            Знаю!
          </button>
        </motion.div>
      )}
    </div>
  )
}
