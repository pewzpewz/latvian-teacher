import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import type { Achievement } from '../data/achievements'
import { TIER_COLORS, TIER_GLOW } from '../data/achievements'
import { useStore } from '../store/useStore'

function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const colors = ['#c41e3a', '#d4a853', '#3ecf8e', '#9b8cff', '#5b9fd4']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return (
    <motion.div
      className="pointer-events-none absolute h-2 w-2 rounded-full"
      style={{ backgroundColor: color, left: `${x}%`, top: '40%' }}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{
        opacity: 0,
        y: -120 - Math.random() * 80,
        x: (Math.random() - 0.5) * 160,
        scale: 0,
        rotate: Math.random() * 360,
      }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    />
  )
}

type Props = {
  achievement: Achievement
  onDismiss: () => void
}

export function AchievementUnlockModal({ achievement, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const tierColor = TIER_COLORS[achievement.tier]
  const tierGlow = TIER_GLOW[achievement.tier]

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      <motion.div
        className={`relative mx-4 max-w-sm overflow-hidden rounded-3xl border border-border bg-surface p-8 text-center ${tierGlow}`}
        initial={{ scale: 0.5, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti */}
        {Array.from({ length: 16 }).map((_, i) => (
          <ConfettiParticle key={i} delay={i * 0.04} x={20 + Math.random() * 60} />
        ))}

        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${tierColor}22 0%, transparent 70%)`,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <motion.p
          className="relative mb-2 text-xs font-semibold uppercase tracking-widest"
          style={{ color: tierColor }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Jauns sasniegums!
        </motion.p>

        <motion.div
          className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-5xl"
          style={{
            background: `linear-gradient(135deg, ${tierColor}33, ${tierColor}11)`,
            border: `2px solid ${tierColor}66`,
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
        >
          {achievement.icon}
        </motion.div>

        <motion.h2
          className="relative mb-2 text-2xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {achievement.title}
        </motion.h2>

        <motion.p
          className="relative mb-6 text-sm text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {achievement.description}
        </motion.p>

        <motion.button
          type="button"
          onClick={onDismiss}
          className="relative rounded-xl px-6 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: tierColor }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Lieliski! 🎉
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export function AchievementProvider() {
  const queue = useStore((s) => s.achievementQueue)
  const dismissAchievement = useStore((s) => s.dismissAchievement)
  const current = queue[0]

  return (
    <AnimatePresence>
      {current && (
        <AchievementUnlockModal
          key={current.id}
          achievement={current}
          onDismiss={dismissAchievement}
        />
      )}
    </AnimatePresence>
  )
}
