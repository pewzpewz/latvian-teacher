import type { UserProgress } from '../store/useStore'
import { lessons } from '../data/lessons'

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  tier: AchievementTier
  category: 'lessons' | 'vocabulary' | 'streak' | 'practice' | 'mastery' | 'special'
  check: (p: UserProgress) => boolean
  progress?: (p: UserProgress) => { current: number; target: number }
}

export type Milestone = {
  id: string
  title: string
  subtitle: string
  icon: string
  target: number
  getValue: (p: UserProgress) => number
  unit: string
}

export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: '#cd7f32',
  silver: '#a8b2c1',
  gold: '#d4a853',
  platinum: '#9b8cff',
}

export const TIER_GLOW: Record<AchievementTier, string> = {
  bronze: 'shadow-[0_0_24px_rgba(205,127,50,0.4)]',
  silver: 'shadow-[0_0_24px_rgba(168,178,193,0.4)]',
  gold: 'shadow-[0_0_28px_rgba(212,168,83,0.5)]',
  platinum: 'shadow-[0_0_32px_rgba(155,140,255,0.55)]',
}

const totalLessons = lessons.length

export const achievements: Achievement[] = [
  {
    id: 'first-step',
    title: 'Pirmie soļi',
    description: 'Пройдите первый урок',
    icon: '🌱',
    tier: 'bronze',
    category: 'lessons',
    check: (p) => p.completedLessons.length >= 1,
    progress: (p) => ({ current: Math.min(p.completedLessons.length, 1), target: 1 }),
  },
  {
    id: 'alphabet-hero',
    title: 'Alfabēta varonis',
    description: 'Освойте латышский алфавит',
    icon: 'Ā',
    tier: 'silver',
    category: 'lessons',
    check: (p) => p.completedLessons.includes('alphabet-1'),
  },
  {
    id: 'grammar-mind',
    title: 'Gramatikas prāts',
    description: 'Пройдите 3 урока грамматики',
    icon: '📐',
    tier: 'silver',
    category: 'lessons',
    check: (p) => p.completedLessons.filter((id) => id.includes('grammar') || id.includes('cases')).length >= 3,
    progress: (p) => ({
      current: p.completedLessons.filter((id) => id.includes('grammar') || id.includes('cases')).length,
      target: 3,
    }),
  },
  {
    id: 'course-complete',
    title: 'Kurss pabeigts!',
    description: 'Пройдите все уроки программы',
    icon: '🎓',
    tier: 'platinum',
    category: 'mastery',
    check: (p) => p.completedLessons.length >= totalLessons,
    progress: (p) => ({ current: p.completedLessons.length, target: totalLessons }),
  },
  {
    id: 'words-10',
    title: 'Desmit vārdi',
    description: 'Выучите 10 слов',
    icon: '📝',
    tier: 'bronze',
    category: 'vocabulary',
    check: (p) => p.wordsLearned >= 10,
    progress: (p) => ({ current: Math.min(p.wordsLearned, 10), target: 10 }),
  },
  {
    id: 'words-25',
    title: 'Vārdu krājums',
    description: 'Выучите 25 слов',
    icon: '📚',
    tier: 'silver',
    category: 'vocabulary',
    check: (p) => p.wordsLearned >= 25,
    progress: (p) => ({ current: Math.min(p.wordsLearned, 25), target: 25 }),
  },
  {
    id: 'words-50',
    title: 'Leksikas meistars',
    description: 'Выучите 50 слов',
    icon: '🏆',
    tier: 'gold',
    category: 'vocabulary',
    check: (p) => p.wordsLearned >= 50,
    progress: (p) => ({ current: Math.min(p.wordsLearned, 50), target: 50 }),
  },
  {
    id: 'streak-3',
    title: 'Trīs dienas',
    description: 'Серия 3 дня подряд',
    icon: '🔥',
    tier: 'bronze',
    category: 'streak',
    check: (p) => p.streak >= 3,
    progress: (p) => ({ current: Math.min(p.streak, 3), target: 3 }),
  },
  {
    id: 'streak-7',
    title: 'Nedēļa!',
    description: 'Серия 7 дней подряд',
    icon: '⚡',
    tier: 'silver',
    category: 'streak',
    check: (p) => p.streak >= 7,
    progress: (p) => ({ current: Math.min(p.streak, 7), target: 7 }),
  },
  {
    id: 'streak-30',
    title: 'Mēnesis spēka',
    description: 'Серия 30 дней — невероятно!',
    icon: '💎',
    tier: 'platinum',
    category: 'streak',
    check: (p) => p.streak >= 30,
    progress: (p) => ({ current: Math.min(p.streak, 30), target: 30 }),
  },
  {
    id: 'exercises-10',
    title: 'Vingrinājumu entuziasts',
    description: 'Выполните 10 упражнений',
    icon: '✏️',
    tier: 'bronze',
    category: 'practice',
    check: (p) => Object.keys(p.exerciseScores).length >= 10,
    progress: (p) => ({ current: Math.min(Object.keys(p.exerciseScores).length, 10), target: 10 }),
  },
  {
    id: 'exercises-30',
    title: 'Prakse padara perfektu',
    description: 'Выполните 30 упражнений',
    icon: '🎯',
    tier: 'gold',
    category: 'practice',
    check: (p) => Object.keys(p.exerciseScores).length >= 30,
    progress: (p) => ({ current: Math.min(Object.keys(p.exerciseScores).length, 30), target: 30 }),
  },
  {
    id: 'voice-first',
    title: 'Pirmā runa',
    description: 'Успешно произнесите первую фразу',
    icon: '🎙️',
    tier: 'bronze',
    category: 'practice',
    check: (p) => p.pronunciationAttempts.correct >= 1,
    progress: (p) => ({ current: Math.min(p.pronunciationAttempts.correct, 1), target: 1 }),
  },
  {
    id: 'dialog-first',
    title: 'Pirmā saruna',
    description: 'Пройдите первый диалог в режиме практики',
    icon: '💬',
    tier: 'bronze',
    category: 'practice',
    check: (p) => p.dialogsCompleted.length >= 1,
    progress: (p) => ({ current: Math.min(p.dialogsCompleted.length, 1), target: 1 }),
  },
  {
    id: 'voice-10',
    title: 'Runātājs',
    description: '10 успешных произношений',
    icon: '🗣️',
    tier: 'silver',
    category: 'practice',
    check: (p) => p.pronunciationAttempts.correct >= 10,
    progress: (p) => ({ current: Math.min(p.pronunciationAttempts.correct, 10), target: 10 }),
  },
  {
    id: 'level-a1',
    title: 'Līmenis A1',
    description: 'Достигните уровня A1',
    icon: '📈',
    tier: 'silver',
    category: 'mastery',
    check: (p) => ['A1', 'A2', 'B1'].includes(p.estimatedLevel),
  },
  {
    id: 'level-a2',
    title: 'Līmenis A2',
    description: 'Достигните уровня A2',
    icon: '🚀',
    tier: 'gold',
    category: 'mastery',
    check: (p) => ['A2', 'B1'].includes(p.estimatedLevel),
  },
  {
    id: 'study-hour',
    title: 'Stunda mācībās',
    description: '60 минут обучения',
    icon: '⏱️',
    tier: 'bronze',
    category: 'special',
    check: (p) => p.totalStudyMinutes >= 60,
    progress: (p) => ({ current: Math.min(p.totalStudyMinutes, 60), target: 60 }),
  },
  {
    id: 'study-marathon',
    title: 'Maratons',
    description: '300 минут обучения',
    icon: '🏃',
    tier: 'gold',
    category: 'special',
    check: (p) => p.totalStudyMinutes >= 300,
    progress: (p) => ({ current: Math.min(p.totalStudyMinutes, 300), target: 300 }),
  },
  {
    id: 'adaptive-learner',
    title: 'Personalizēts',
    description: 'Получите персональный контент от AI',
    icon: '🤖',
    tier: 'silver',
    category: 'special',
    check: (p) => p.adaptiveExercises.length > 0 || p.adaptiveWords.length > 0,
  },
  {
    id: 'accuracy-ace',
    title: 'Precizitāte',
    description: '80%+ точность при 20+ упражнениях',
    icon: '🎖️',
    tier: 'gold',
    category: 'mastery',
    check: (p) => {
      const scores = Object.values(p.exerciseScores)
      if (scores.length < 20) return false
      const correct = scores.filter(Boolean).length
      return correct / scores.length >= 0.8
    },
  },
  {
    id: 'first-game',
    title: 'Pirmā spēle',
    description: 'Сыграйте в любую игру',
    icon: '🎮',
    tier: 'bronze',
    category: 'practice',
    check: (p) => p.gameStats.totalPlays >= 1,
  },
  {
    id: 'laiva-captain',
    title: 'Daugavas kapteinis',
    description: 'Проплывите 300+ метров в Daugavas laiva',
    icon: '⛵',
    tier: 'silver',
    category: 'practice',
    check: (p) => (p.gameStats.bestScores.laiva ?? 0) >= 300,
  },
  {
    id: 'ligo-fire',
    title: 'Līgo uguns',
    description: 'Наберите 150+ очков в Līgo uguns',
    icon: '🔥',
    tier: 'silver',
    category: 'practice',
    check: (p) => (p.gameStats.bestScores.ligo ?? 0) >= 150,
  },
  {
    id: 'game-master',
    title: 'Spēļu meistars',
    description: 'Сыграйте 10 игр',
    icon: '🏆',
    tier: 'gold',
    category: 'practice',
    check: (p) => p.gameStats.totalPlays >= 10,
    progress: (p) => ({ current: Math.min(p.gameStats.totalPlays, 10), target: 10 }),
  },
]

export const milestones: Milestone[] = [
  {
    id: 'm-lessons-1',
    title: 'Первый урок',
    subtitle: 'Начало пути',
    icon: '🌅',
    target: 1,
    getValue: (p) => p.completedLessons.length,
    unit: 'урок',
  },
  {
    id: 'm-lessons-3',
    title: 'Три урока',
    subtitle: 'Фундамент заложен',
    icon: '🧱',
    target: 3,
    getValue: (p) => p.completedLessons.length,
    unit: 'урока',
  },
  {
    id: 'm-lessons-half',
    title: 'Полпути',
    subtitle: 'Половина программы',
    icon: '🛤️',
    target: Math.ceil(totalLessons / 2),
    getValue: (p) => p.completedLessons.length,
    unit: 'уроков',
  },
  {
    id: 'm-lessons-all',
    title: 'Программа пройдена',
    subtitle: 'Visi nodarbības!',
    icon: '🏁',
    target: totalLessons,
    getValue: (p) => p.completedLessons.length,
    unit: 'уроков',
  },
  {
    id: 'm-words-10',
    title: '10 слов',
    subtitle: 'Первый словарный запас',
    icon: '💬',
    target: 10,
    getValue: (p) => p.wordsLearned,
    unit: 'слов',
  },
  {
    id: 'm-words-30',
    title: '30 слов',
    subtitle: 'Уверенная база',
    icon: '📖',
    target: 30,
    getValue: (p) => p.wordsLearned,
    unit: 'слов',
  },
  {
    id: 'm-streak-7',
    title: 'Неделя подряд',
    subtitle: 'Disciplīna!',
    icon: '🔥',
    target: 7,
    getValue: (p) => p.streak,
    unit: 'дней',
  },
  {
    id: 'm-time-60',
    title: 'Час учёбы',
    subtitle: 'Время — инвестиция',
    icon: '⌛',
    target: 60,
    getValue: (p) => p.totalStudyMinutes,
    unit: 'мин',
  },
  {
    id: 'm-level-a1',
    title: 'Уровень A1',
    subtitle: 'Tu runā latviski!',
    icon: '⭐',
    target: 1,
    getValue: (p) => (['A1', 'A2', 'B1'].includes(p.estimatedLevel) ? 1 : 0),
    unit: '',
  },
]

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id)
}

export function checkNewAchievements(
  progress: UserProgress,
  alreadyUnlocked: string[],
): Achievement[] {
  return achievements.filter(
    (a) => !alreadyUnlocked.includes(a.id) && a.check(progress),
  )
}

export function getUnlockedCount(_progress: UserProgress, unlocked: string[]): number {
  return unlocked.length
}

export function getTotalXp(unlocked: string[]): number {
  const xpMap: Record<AchievementTier, number> = { bronze: 10, silver: 25, gold: 50, platinum: 100 }
  return unlocked.reduce((sum, id) => {
    const a = getAchievementById(id)
    return sum + (a ? xpMap[a.tier] : 0)
  }, 0)
}

export const CATEGORY_LABELS: Record<Achievement['category'], string> = {
  lessons: 'Уроки',
  vocabulary: 'Словарь',
  streak: 'Серии',
  practice: 'Практика',
  mastery: 'Мастерство',
  special: 'Особые',
}
