import { motion } from 'framer-motion'
import type { UserProgress } from '../store/useStore'
import type { Achievement } from '../data/achievements'
import { TIER_COLORS, TIER_GLOW } from '../data/achievements'

type Props = {
  achievement: Achievement
  unlocked: boolean
  progress: UserProgress
  index: number
}

export function AchievementCard({ achievement, unlocked, progress, index }: Props) {
  const tierColor = TIER_COLORS[achievement.tier]
  const prog = achievement.progress?.(progress)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
        unlocked
          ? `border-border bg-surface-2 ${TIER_GLOW[achievement.tier]}`
          : 'border-border/50 bg-surface/50 opacity-60'
      }`}
    >
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/40 backdrop-blur-[1px]">
          <span className="text-2xl opacity-40">🔒</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <motion.div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
          style={{
            background: unlocked
              ? `linear-gradient(135deg, ${tierColor}33, ${tierColor}11)`
              : 'var(--color-surface)',
            border: unlocked ? `1px solid ${tierColor}44` : '1px solid var(--color-border)',
          }}
          animate={unlocked ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          {achievement.icon}
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{achievement.title}</h3>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
              style={{
                backgroundColor: `${tierColor}22`,
                color: tierColor,
              }}
            >
              {achievement.tier}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted">{achievement.description}</p>

          {!unlocked && achievement.progress && prog && (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>
                  {prog.current} / {prog.target}
                </span>
                <span>{Math.round((prog.current / prog.target) * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (prog.current / prog.target) * 100)}%`,
                    backgroundColor: tierColor,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

type MilestoneProps = {
  title: string
  subtitle: string
  icon: string
  current: number
  target: number
  unit: string
  reached: boolean
  isLast: boolean
  index: number
}

export function MilestoneNode({
  title,
  subtitle,
  icon,
  current,
  target,
  unit,
  reached,
  isLast,
  index,
}: MilestoneProps) {
  const pct = Math.min(100, (current / target) * 100)

  return (
    <motion.div
      className="relative flex gap-5"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[27px] top-14 h-[calc(100%-8px)] w-0.5 overflow-hidden bg-border">
          <motion.div
            className="w-full bg-gradient-to-b from-accent to-gold"
            initial={{ height: 0 }}
            animate={{ height: reached ? '100%' : `${pct}%` }}
            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
          />
        </div>
      )}

      {/* Node circle */}
      <motion.div
        className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl ${
          reached
            ? 'bg-gradient-to-br from-accent to-gold shadow-[0_0_20px_rgba(196,30,58,0.4)]'
            : 'border-2 border-border bg-surface-2'
        }`}
        animate={reached ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
      >
        {reached ? icon : <span className="text-muted opacity-50">{icon}</span>}
      </motion.div>

      {/* Content */}
      <div className={`flex-1 pb-10 ${reached ? '' : 'opacity-70'}`}>
        <div className="rounded-2xl border border-border bg-surface-2 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-semibold ${reached ? 'text-text' : 'text-muted'}`}>{title}</h3>
              <p className="text-sm text-muted">{subtitle}</p>
            </div>
            {reached && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="rounded-full bg-success/15 px-2 py-1 text-xs text-success"
              >
                ✓
              </motion.span>
            )}
          </div>
          {!reached && (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted">
                  {current} / {target} {unit}
                </span>
                <span className="text-accent">{Math.round(pct)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-gold"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

type RingProps = {
  value: number
  max: number
  label: string
  sublabel: string
  color: string
  delay?: number
}

export function ProgressRing({ value, max, label, sublabel, color, delay = 0 }: RingProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
    >
      <div className="relative">
        <svg width="140" height="140" className="-rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth="10"
          />
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, delay: delay + 0.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(pct)}%</span>
          <span className="text-xs text-muted">
            {value}/{max}
          </span>
        </div>
      </div>
      <p className="mt-3 font-medium">{label}</p>
      <p className="text-xs text-muted">{sublabel}</p>
    </motion.div>
  )
}
