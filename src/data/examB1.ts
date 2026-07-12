export type LearningGoal = 'exam' | 'daily' | 'work' | 'general'

export type ExamQuestion = {
  id: string
  type: 'choose' | 'fill' | 'translate'
  question: string
  passage?: string
  answer: string
  options?: string[]
  hint?: string
}

export type ExamSection = {
  id: string
  title: string
  type: 'reading' | 'grammar'
  description: string
  timeMinutes: number
  questions: ExamQuestion[]
}

export const EXAM_OFFICIAL_LINKS = [
  {
    title: 'Valsts valodas prasmes pārbaude (VISC)',
    url: 'https://www.valoda.lv/',
    description: 'Официальный портал LVA — экзамены, материалы, регистрация',
  },
  {
    title: 'LVA — программа A1–C2',
    url: 'https://www.valoda.lv/lv/vispareja-informacija/valodas-prasme',
    description: 'Описание уровней и требований',
  },
  {
    title: 'Latviešu valodas mācību materiāli',
    url: 'https://www.valoda.lv/lv/macibas/materiali',
    description: 'Учебные материалы для подготовки',
  },
]

export const examSections: ExamSection[] = [
  {
    id: 'reading-1',
    title: 'Чтение — повседневные тексты',
    type: 'reading',
    description: 'Прочитайте короткий текст и ответьте на вопросы (формат B1, упрощённо).',
    timeMinutes: 15,
    questions: [
      {
        id: 'r1',
        type: 'choose',
        passage:
          'Rīgā katru gadu notiek daudzi kultūras pasākumi. Vasarā pilsētas iedzīvotāji un tūristi bieži apmeklē Jāņu svinības un dažādus koncertus. Ziemā populāras ir Ziemassvētku tirdzniecības.',
        question: 'Kad notiek Jāņu svinības?',
        answer: 'Vasarā',
        options: ['Vasarā', 'Ziemā', 'Rudens', 'Pavasarī'],
      },
      {
        id: 'r2',
        type: 'choose',
        passage:
          'Rīgā katru gadu notiek daudzi kultūras pasākumi. Vasarā pilsētas iedzīvotāji un tūristi bieži apmeklē Jāņu svinības un dažādus koncertus.',
        question: 'Kas apmeklē pasākumus?',
        answer: 'Iedzīvotāji un tūristi',
        options: ['Tikai bērni', 'Iedzīvotāji un tūristi', 'Tikai skolēni', 'Neviens'],
      },
      {
        id: 'r3',
        type: 'choose',
        passage: 'Ziemā populāras ir Ziemassvētku tirdzniecības.',
        question: 'О чём это предложение?',
        answer: 'О зимних ярмарках',
        options: ['О зимних ярмарках', 'О летних концертах', 'О школе', 'О транспорте'],
      },
    ],
  },
  {
    id: 'reading-2',
    title: 'Чтение — объявление',
    type: 'reading',
    description: 'Понимание практических объявлений — типичная задача экзамена.',
    timeMinutes: 10,
    questions: [
      {
        id: 'r4',
        type: 'choose',
        passage:
          'SLIMNĪCA: Pacientu pieņemšana darba dienās no 8:00 līdz 17:00. Steidzamos gadījumos zvaniet 113. Reģistrācijai nepieciešama pase un veselības apdrošināšanas karte.',
        question: 'Kad strādā reģistratūra?',
        answer: 'Darba dienās 8–17',
        options: ['Visu diennakti', 'Darba dienās 8–17', 'Tikai sestdienās', 'No 12:00'],
      },
      {
        id: 'r5',
        type: 'choose',
        passage:
          'SLIMNĪCA: Pacientu pieņemšana darba dienās no 8:00 līdz 17:00. Steidzamos gadījumos zvaniet 113.',
        question: 'Steidzamā palīdzība — kur zvanīt?',
        answer: '113',
        options: ['112', '113', '911', '1188'],
      },
    ],
  },
  {
    id: 'grammar-1',
    title: 'Грамматика — глаголы и падежи',
    type: 'grammar',
    description: 'Базовая грамматика уровня A2–B1.',
    timeMinutes: 12,
    questions: [
      {
        id: 'g1',
        type: 'fill',
        question: 'Es ___ latviešu valodu. (учу)',
        answer: 'mācos',
      },
      {
        id: 'g2',
        type: 'choose',
        question: 'Выберите правильную форму: «Я живу в Риге»',
        answer: 'Es dzīvoju Rīgā.',
        options: ['Es dzīvoju Rīgā.', 'Es dzīvo Rīga.', 'Es dzīvoju Rīgu.', 'Es dzīvoju Rīgas.'],
      },
      {
        id: 'g3',
        type: 'fill',
        question: 'Man ___ trīsdesmit gadi. (есть / мне)',
        answer: 'ir',
      },
      {
        id: 'g4',
        type: 'translate',
        question: 'Переведите: «Мне нужен паспорт»',
        answer: 'Man vajag pasi',
        hint: 'vajag + akuzatīvs',
      },
    ],
  },
  {
    id: 'grammar-2',
    title: 'Грамматика — словообразование',
    type: 'grammar',
    description: 'Приставки, суффиксы и части речи — часто на экзамене B1.',
    timeMinutes: 10,
    questions: [
      {
        id: 'g5',
        type: 'choose',
        question: 'Профессия «учитель» (муж.):',
        answer: 'skolotājs',
        options: ['skolotājs', 'skola', 'mācīties', 'skolēns'],
      },
      {
        id: 'g6',
        type: 'choose',
        question: 'Antonīms vārdam «labs» (хороший):',
        answer: 'slikts',
        options: ['slikts', 'liels', 'jauns', 'ātrs'],
      },
      {
        id: 'g7',
        type: 'fill',
        question: 'Viņa strādā ___. (в больнице — slimnīca)',
        answer: 'slimnīcā',
        hint: 'Vieta — lokatīvs',
      },
    ],
  },
]

export function getExamSection(id: string): ExamSection | undefined {
  return examSections.find((s) => s.id === id)
}

export const GOAL_LABELS: Record<string, string> = {
  exam: 'Экзамен VISC B1',
  daily: 'Повседневное общение',
  work: 'Работа и карьера',
  general: 'Общее развитие',
}
