export type LearningGoal = 'exam' | 'daily' | 'work' | 'general'

export type ExamQuestion = {
  id: string
  type: 'choose' | 'fill' | 'translate' | 'writing' | 'speaking'
  question: string
  passage?: string
  answer: string
  options?: string[]
  hint?: string
  keywords?: string[]
  sampleAnswer?: string
}

export type ExamSectionType = 'reading' | 'grammar' | 'writing' | 'listening' | 'speaking' | 'speaking-live'

export type ExamSection = {
  id: string
  title: string
  type: ExamSectionType
  description: string
  timeMinutes: number
  /** Текст для TTS — только аудирование, не показывается до ответа */
  audioScript?: string
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
  {
    id: 'listening-1',
    title: 'Аудирование — объявление',
    type: 'listening',
    description: 'Прослушайте объявление (TTS) и ответьте на вопросы — как на экзамене B1.',
    timeMinutes: 12,
    audioScript:
      'Labdien! Ar autobusu numur divi simts piecpadsmit jūs varat nokļūt lidostā. Biļetes cena ir divi eiro. Autobuss atiet no pieturas pie Centrālās stacijas katras pusstundas.',
    questions: [
      {
        id: 'l1',
        type: 'choose',
        question: 'Kur var nokļūt ar autobusu 215?',
        answer: 'Lidostā',
        options: ['Lidostā', 'Jūrmalā', 'Centrāltirgū', 'Mežā'],
      },
      {
        id: 'l2',
        type: 'choose',
        question: 'Cik maksā biļete?',
        answer: 'Divi eiro',
        options: ['Viens eiro', 'Divi eiro', 'Trīs eiro', 'Bezmaksas'],
      },
      {
        id: 'l3',
        type: 'choose',
        question: 'No kurienes atiet autobuss?',
        answer: 'Pie Centrālās stacijas',
        options: [
          'Pie Centrālās stacijas',
          'Pie lidostas',
          'Pie Rīgas doms',
          'Pie universitātes',
        ],
      },
    ],
  },
  {
    id: 'listening-2',
    title: 'Аудирование — телефонный разговор',
    type: 'listening',
    description: 'Короткий диалог по телефону — типичная задача VISC B1.',
    timeMinutes: 10,
    audioScript:
      'Allo! Jā, labdien. Es vēlos pierakstīties pie ārsta. Man sāp galva jau divas dienas. Vai ir brīvs laiks piektdienā pulksten trīs? Jā, labi. Paldies, uz redzēšanos!',
    questions: [
      {
        id: 'l4',
        type: 'choose',
        question: 'Kāpēc zvanītājs vēlas pierakstīties?',
        answer: 'Sāp galva',
        options: ['Sāp galva', 'Grib ceļot', 'Meklē darbu', 'Grib mācīties valodu'],
      },
      {
        id: 'l5',
        type: 'choose',
        question: 'Kad ir vizīte?',
        answer: 'Piektdienā pulksten trīs',
        options: [
          'Piektdienā pulksten trīs',
          'Rīt no rīta',
          'Sestdienā',
          'Nekad',
        ],
      },
    ],
  },
  {
    id: 'writing-1',
    title: 'Письмо — формальное письмо',
    type: 'writing',
    description: 'Напишите короткое письмо (3–5 предложений) — формат экзамена B1.',
    timeMinutes: 20,
    questions: [
      {
        id: 'w1',
        type: 'writing',
        question:
          'Напишите письмо учителю: завтра не сможете прийти на занятие и просите прощения. Укажите причину (например, визит к врачу).',
        answer: 'Labdien! Es atvainojos, bet rīt nevaru nākt uz nodarbību, jo man ir vizīte pie ārsta. Vai varu saņemt mājasdarbu? Paldies!',
        keywords: ['labdien', 'rīt', 'nevaru', 'nodarb', 'atvainoj', 'ārsta', 'paldies'],
        sampleAnswer:
          'Labdien! Es atvainojos, bet rīt nevaru nākt uz nodarbību, jo man ir vizīte pie ārsta. Vai varu saņemt mājasdarbu? Paldies!',
        hint: 'Labdien → причина → вежливая просьба → Paldies',
      },
      {
        id: 'w2',
        type: 'writing',
        question:
          'Напишите короткое сообщение другу: пригласите его в субботу в кино и предложите встретиться у центрального вокзала в 18:00.',
        answer:
          'Sveiks! Vai gribi iet uz kino sestdien? Satiksimies pie Centrālās stacijas pulksten astoņpadsmit. Gaidīšu atbildi!',
        keywords: ['sestdien', 'kino', 'satik', 'centrāl', 'pulksten', 'astoņ'],
        sampleAnswer:
          'Sveiks! Vai gribi iet uz kino sestdien? Satiksimies pie Centrālās stacijas pulksten astoņpadsmit. Gaidīšu atbildi!',
        hint: 'Sveiks/Sveika → приглашение → место и время',
      },
    ],
  },
  {
    id: 'speaking-1',
    title: 'Говорение — базовые фразы',
    type: 'speaking',
    description: 'Произнесите фразу вслух (микрофон). Полный экзамен — раздел «Live экзаменатор».',
    timeMinutes: 10,
    questions: [
      {
        id: 's1',
        type: 'speaking',
        question: 'Поприветствуйте экзаменатора (формально).',
        answer: 'Labdien',
        keywords: ['labdien'],
        hint: 'Labdien — нейтральное формальное приветствие',
      },
      {
        id: 's2',
        type: 'speaking',
        question: 'Скажите: «Меня зовут …» (подставьте любое имя).',
        answer: 'Mani sauc',
        keywords: ['mani', 'sauc'],
        hint: 'Mani sauc + vārds',
      },
      {
        id: 's3',
        type: 'speaking',
        question: 'Поблагодарите и попрощайтесь.',
        answer: 'Paldies, uz redzēšanos',
        keywords: ['paldies', 'redzēšanos'],
        hint: 'Paldies, uz redzēšanos!',
      },
    ],
  },
  {
    id: 'speaking-live-1',
    title: 'Говорение B1 — Live экзаменатор',
    type: 'speaking-live',
    description:
      'Полноценный устный экзамен через WebRTC: 4 задания с AI-экзаменатором (VISC формат).',
    timeMinutes: 15,
    questions: [],
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
