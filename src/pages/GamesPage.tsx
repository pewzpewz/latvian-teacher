import { useEffect, useState, type ComponentType } from 'react'
import { ArrowLeft, Gamepad2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { gameDefinitions, type GameId } from '../data/games'
import { LaivaRaceGame } from '../components/games/LaivaRaceGame'
import { LigoFireGame } from '../components/games/LigoFireGame'
import { WordMatchGame } from '../components/games/WordMatchGame'
import { WordScrambleGame } from '../components/games/WordScrambleGame'
import { useStore } from '../store/useStore'
import { useTranslation } from '../hooks/useTranslation'

const gameComponents: Record<
  GameId,
  ComponentType<{ onFinish: (score: number, correct: number, total: number) => void; onRestart?: () => void }>
> = {
  laiva: LaivaRaceGame,
  ligo: LigoFireGame,
  match: WordMatchGame,
  scramble: WordScrambleGame,
}

export function GamesPage() {
  const { t } = useTranslation()
  const [active, setActive] = useState<GameId | null>(null)
  const [sessionKey, setSessionKey] = useState(0)
  const { progress, recordGameResult, updateStreak, addStudyTime } = useStore()

  useEffect(() => {
    updateStreak()
  }, [updateStreak])

  const handleFinish = (gameId: GameId, score: number, correct: number, total: number) => {
    recordGameResult(gameId, score, correct, total)
    addStudyTime(2)
  }

  const restart = () => setSessionKey((k) => k + 1)

  const ActiveGame = active ? gameComponents[active] : null
  const activeMeta = active ? gameDefinitions.find((g) => g.id === active) : null

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="gradient-text text-3xl font-bold">{t('games.title')}</h1>
          <p className="mt-2 text-muted">{t('games.subtitle')}</p>
        </div>
        {!active && (
          <div className="glass rounded-xl px-4 py-2 text-sm">
            <span className="text-muted">{t('common.gamesPlayed')} </span>
            <strong className="text-gold">{progress.gameStats.totalPlays}</strong>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {active && ActiveGame && activeMeta ? (
          <motion.div
            key={`${active}-${sessionKey}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="mb-4 flex items-center gap-2 text-sm text-muted hover:text-text"
            >
              <ArrowLeft size={16} /> {t('games.back')}
            </button>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl">{activeMeta.icon}</span>
              <div>
                <h2 className="text-xl font-bold">{t(activeMeta.titleKey)}</h2>
                <p className="text-sm text-muted">{t(activeMeta.subtitleKey)}</p>
              </div>
            </div>
            <ActiveGame
              onFinish={(score, correct, total) => {
                handleFinish(active, score, correct, total)
              }}
              onRestart={restart}
            />
            <button
              type="button"
              onClick={restart}
              className="mt-4 text-sm text-muted underline hover:text-text"
            >
              {t('games.restart')}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {gameDefinitions.map((game, i) => {
              const best = progress.gameStats.bestScores[game.id] ?? 0
              const plays = progress.gameStats.playsByGame[game.id] ?? 0
              return (
                <motion.button
                  key={game.id}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => {
                    setSessionKey((k) => k + 1)
                    setActive(game.id)
                  }}
                  className="glass card-hover rounded-2xl p-6 text-left"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{game.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{t(game.titleKey)}</h3>
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted">
                          {t(game.themeKey)}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm font-medium ${game.color}`}>{t(game.subtitleKey)}</p>
                      <p className="mt-2 text-sm text-muted">{t(game.descriptionKey)}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {game.skillKeys.map((s) => (
                          <span key={s} className="rounded-lg bg-surface-2 px-2 py-0.5 text-xs text-muted">
                            {t(s)}
                          </span>
                        ))}
                      </div>
                      {(best > 0 || plays > 0) && (
                        <p className="mt-3 text-xs text-muted">
                          {plays > 0 && t('common.plays', { count: plays })}
                          {best > 0 && ` · ${t('common.record', { score: best })}`}
                        </p>
                      )}
                    </div>
                    <Gamepad2 size={20} className="shrink-0 text-muted" />
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
