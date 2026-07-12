import { test, expect } from '@playwright/test'

const defaultSettings = {
  dailyGoal: 15,
  nativeLanguage: 'ru',
  showTransliteration: true,
  speechRate: 0.85,
  aiProvider: 'gemini',
  aiModel: 'gemini-3-flash-preview',
  aiApiKey: '',
  userName: 'E2E',
  adaptiveEnabled: true,
  ttsEngine: 'neural',
  ttsVoice: 'lv-LV-EveritaNeural',
  onboardingCompleted: true,
  learningGoal: 'general',
  selfReportedLevel: 'A1',
  uiLanguage: 'ru',
  streakReminderEnabled: false,
  streakReminderHour: 19,
}

const defaultProgress = {
  completedLessons: [],
  exerciseScores: {},
  srsCards: {},
  streak: 0,
  lastStudyDate: null,
  totalStudyMinutes: 0,
  todayStudyMinutes: 0,
  todayStudyDate: null,
  wordsLearned: 0,
  estimatedLevel: 'A0',
  categoryStats: {},
  exerciseAttempts: [],
  pronunciationAttempts: { correct: 0, total: 0 },
  adaptiveWords: [],
  adaptiveExercises: [],
  lastAdaptationAt: null,
  unlockedAchievements: [],
  achievementTimestamps: {},
  gameStats: { totalPlays: 0, totalCorrect: 0, bestScores: {}, playsByGame: {} },
  dialogsCompleted: [],
  chatHistory: [],
  firstStudyDate: null,
  studyDayLog: {},
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ settings, progress }) => {
      localStorage.setItem('lv-settings', JSON.stringify(settings))
      localStorage.setItem('lv-progress', JSON.stringify(progress))
    },
    { settings: defaultSettings, progress: defaultProgress },
  )
})

test('critical path: lesson → SRS → progress', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/')
  await expect(page.getByTestId('app-ready')).toBeVisible({ timeout: 15_000 })

  // ── Lesson: alphabet-1 (choose exercise) ──
  await page.goto('/lessons/alphabet-1')
  await expect(page.getByRole('heading', { name: 'Латышский алфавит' })).toBeVisible()
  await page.getByRole('heading', { name: 'Упражнения' }).scrollIntoViewIfNeeded()

  // Exercise 1: translate
  await page.getByPlaceholder('Ваш ответ на латышском...').fill('ūdens')
  await page.getByRole('button', { name: 'Проверить' }).click()
  await expect(page.getByText('Верно!')).toBeVisible()
  await page.getByRole('button', { name: 'Следующее' }).click()

  // Exercise 2: choose
  await page.getByRole('button', { name: 'č', exact: true }).click()
  await page.getByRole('button', { name: 'Проверить' }).click()
  await expect(page.getByText('Верно!')).toBeVisible()
  await page.getByRole('button', { name: 'Следующее' }).click()

  // Exercise 3: translate
  await page.getByPlaceholder('Ваш ответ на латышском...').fill('sēta')
  await page.getByRole('button', { name: 'Проверить' }).click()
  await page.getByRole('button', { name: 'Завершить урок' }).click()

  await expect(page.getByText('Урок завершён!')).toBeVisible()

  // ── SRS vocabulary cards ──
  await page.goto('/vocabulary?mode=cards')
  await expect(page.getByRole('button', { name: 'Карточки' })).toBeVisible()
  await page.locator('.cursor-pointer').first().click()
  await page.getByRole('button', { name: 'Знаю!' }).click()

  // ── Progress page reflects activity ──
  await page.goto('/progress')
  await expect(page.getByRole('paragraph').filter({ hasText: /^Уроки$/ })).toBeVisible()
  await expect(page.getByText(/\d+\/\d+/).first()).toBeVisible()
})
