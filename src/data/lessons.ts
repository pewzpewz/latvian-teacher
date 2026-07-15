import type { LvaTheme } from './lvaThemes'
import { lessonsExtra } from './lessonsExtra'

export type LessonSection = {
  title: string
  content: string
  examples?: { lv: string; ru: string; note?: string }[]
  tip?: string
}

export type Lesson = {
  id: string
  title: string
  subtitle: string
  level: 'A0' | 'A1' | 'A2' | 'B1'
  category: 'alphabet' | 'grammar' | 'phrases' | 'culture' | 'writing'
  lvaTheme: LvaTheme
  duration: number
  sections: LessonSection[]
  exercises?: Exercise[]
}

export type Exercise = {
  id: string
  type: 'translate' | 'fill' | 'choose' | 'match'
  question: string
  answer: string
  options?: string[]
  hint?: string
  skillIds?: string[]
}

const coreLessons: Lesson[] = [
  {
    id: 'alphabet-1',
    title: 'Латышский алфавит',
    subtitle: '33 буквы и особые знаки',
    level: 'A0',
    category: 'alphabet',
    lvaTheme: 'education',
    duration: 20,
    sections: [
      {
        title: 'Основы',
        content:
          'Латышский алфавит основан на латинице и состоит из 33 букв. В отличие от русского, здесь нет буквы «ы», зато есть специальные буквы с макроном (длинный гласный) и с кедилем (мягкий согласный).',
        examples: [
          { lv: 'A, B, C, D, E', ru: 'как в латинице' },
          { lv: 'Ā, Ē, Ī, Ū', ru: 'длинные гласные (макрон)' },
          { lv: 'Č, Ģ, Ķ, Ļ, Ņ, Š, Ž', ru: 'мягкие/шипящие (кедиль)' },
        ],
        tip: 'Длинные гласные произносятся примерно в 1.5 раза дольше коротких — это меняет смысл слова!',
      },
      {
        title: 'Длинные гласные',
        content: 'Макрон над гласной означает долготу. Без него — короткий звук.',
        examples: [
          { lv: 'kārs', ru: 'горячий', note: 'ā — долго' },
          { lv: 'kars', ru: 'война', note: 'a — коротко' },
          { lv: 'sēta', ru: 'двор, ограда' },
          { lv: 'līst', ru: 'падает (о дожде)' },
          { lv: 'ūdens', ru: 'вода' },
        ],
      },
      {
        title: 'Буквы с кедилем',
        content: 'Кедиль (запятка под буквой) смягчает согласный или обозначает специальный звук.',
        examples: [
          { lv: 'č', ru: 'как «ч» в «чай»' },
          { lv: 'š', ru: 'как «ш» в «шар»' },
          { lv: 'ž', ru: 'как «ж» в «жук»' },
          { lv: 'ģ', ru: 'мягкое «г», похоже на «дь»' },
          { lv: 'ķ', ru: 'мягкое «к», похоже на «ть»' },
          { lv: 'ļ', ru: 'мягкое «л», как «ль»' },
          { lv: 'ņ', ru: 'мягкое «н», как «нь»' },
        ],
      },
    ],
    exercises: [
      {
        id: 'a1',
        type: 'translate',
        question: 'Переведите: вода',
        answer: 'ūdens',
        hint: 'Длинная «ū»',
        skillIds: ['phoneme-long-u', 'topic-alphabet'],
      },
      {
        id: 'a2',
        type: 'choose',
        question: 'Какая буква обозначает «ч»?',
        answer: 'č',
        options: ['c', 'č', 'š', 'ž'],
        skillIds: ['phoneme-ch', 'topic-alphabet'],
      },
      {
        id: 'a3',
        type: 'translate',
        question: 'Переведите: двор',
        answer: 'sēta',
        hint: 'Длинная «ē»',
        skillIds: ['phoneme-long-e', 'topic-alphabet'],
      },
    ],
  },
  {
    id: 'greetings-1',
    title: 'Приветствия и знакомство',
    subtitle: 'Первые фразы для общения',
    level: 'A1',
    category: 'phrases',
    lvaTheme: 'identity',
    duration: 15,
    sections: [
      {
        title: 'Приветствия',
        content: 'Базовые приветствия для любого времени суток и ситуации.',
        examples: [
          { lv: 'Sveiki!', ru: 'Привет! (мн.ч. / универсальное)' },
          { lv: 'Labrīt!', ru: 'Доброе утро!' },
          { lv: 'Labdien!', ru: 'Добрый день!' },
          { lv: 'Labvakar!', ru: 'Добрый вечер!' },
          { lv: 'Ar labu nakti!', ru: 'Спокойной ночи!' },
          { lv: 'Uz redzēšanos!', ru: 'До свидания!' },
        ],
      },
      {
        title: 'Знакомство',
        content: 'Как представиться и спросить имя.',
        examples: [
          { lv: 'Kā Tevi sauc?', ru: 'Как тебя зовут?' },
          { lv: 'Mani sauc...', ru: 'Меня зовут...' },
          { lv: 'Prieks iepazīties!', ru: 'Приятно познакомиться!' },
          { lv: 'No kurienes Tu esi?', ru: 'Откуда ты?' },
          { lv: 'Es esmu no Latvijas.', ru: 'Я из Латвии.' },
          { lv: 'Es runāju krieviski.', ru: 'Я говорю по-русски.' },
        ],
        tip: '«Te» с большой буквы — вежливое обращение (Вы). «tu» — неформальное «ты».',
      },
      {
        title: 'Вежливость',
        content: 'Слова, которые пригодятся каждый день.',
        examples: [
          { lv: 'Paldies!', ru: 'Спасибо!' },
          { lv: 'Lūdzu!', ru: 'Пожалуйста!' },
          { lv: 'Atvainojiet!', ru: 'Извините!' },
          { lv: 'Jā', ru: 'Да' },
          { lv: 'Nē', ru: 'Нет' },
          { lv: 'Labi', ru: 'Хорошо' },
        ],
      },
    ],
    exercises: [
      {
        id: 'g1',
        type: 'translate',
        question: 'Переведите: Добрый день!',
        answer: 'Labdien!',
        skillIds: ['topic-greetings'],
      },
      {
        id: 'g2',
        type: 'translate',
        question: 'Переведите: Спасибо!',
        answer: 'Paldies!',
        skillIds: ['topic-greetings'],
      },
      {
        id: 'g3',
        type: 'choose',
        question: 'Как сказать «Приятно познакомиться»?',
        answer: 'Prieks iepazīties!',
        options: ['Kā Tevi sauc?', 'Prieks iepazīties!', 'Uz redzēšanos!', 'Labdien!'],
        skillIds: ['topic-greetings'],
      },
    ],
  },
  {
    id: 'grammar-nouns-1',
    title: 'Род и число существительных',
    subtitle: 'Vīriešu, sieviešu un neitrālais dzimte',
    level: 'A1',
    category: 'grammar',
    lvaTheme: 'education',
    duration: 25,
    sections: [
      {
        title: 'Три рода',
        content:
          'В латышском три рода: мужской (vīriešu), женский (sieviešu) и средний (neitrālais). Род определяет форму прилагательных и глаголов в прошедшем времени.',
        examples: [
          { lv: 'tēvs', ru: 'отец (м.р.)' },
          { lv: 'māte', ru: 'мать (ж.р.)' },
          { lv: 'bērns', ru: 'ребёнок (ср.р.)' },
          { lv: 'brālis', ru: 'брат (м.р.)' },
          { lv: 'māsa', ru: 'сестра (ж.р.)' },
        ],
        tip: 'Средний род часто обозначает молодых людей и животных: bērns (ребёнок), kucēns (котёнок).',
      },
      {
        title: 'Множественное число',
        content: 'Основные окончания множественного числа:',
        examples: [
          { lv: 'māja → mājas', ru: 'дом → дома' },
          { lv: 'tēvs → tēvi', ru: 'отец → отцы' },
          { lv: 'bērns → bērni', ru: 'ребёнок → дети' },
          { lv: 'pilsēta → pilsētas', ru: 'город → города' },
          { lv: 'draugs → draugi', ru: 'друг → друзья' },
        ],
      },
    ],
    exercises: [
      {
        id: 'n1',
        type: 'choose',
        question: 'Какой род у слова «māte»?',
        answer: 'sieviešu',
        options: ['vīriešu', 'sieviešu', 'neitrālais'],
        skillIds: ['noun-nom-sg'],
      },
      {
        id: 'n2',
        type: 'translate',
        question: 'Множественное число от «draugs» (друг)?',
        answer: 'draugi',
        skillIds: ['noun-nom-sg'],
      },
    ],
  },
  {
    id: 'grammar-verbs-1',
    title: 'Глагол «būt» — быть',
    subtitle: 'Самый важный глагол',
    level: 'A1',
    category: 'grammar',
    lvaTheme: 'education',
    duration: 20,
    sections: [
      {
        title: 'Настоящее время',
        content: 'Глагол «būt» (быть) — основа для построения многих конструкций.',
        examples: [
          { lv: 'es esmu', ru: 'я есть / я —' },
          { lv: 'tu esi', ru: 'ты есть / ты —' },
          { lv: 'viņš/viņa ir', ru: 'он/она есть' },
          { lv: 'mēs esam', ru: 'мы есть / мы —' },
          { lv: 'jūs esat', ru: 'вы есть / вы —' },
          { lv: 'viņi/viņas ir', ru: 'они есть' },
        ],
      },
      {
        title: 'Примеры',
        content: 'Как использовать в речи:',
        examples: [
          { lv: 'Es esmu students.', ru: 'Я студент.' },
          { lv: 'Viņa ir skolotāja.', ru: 'Она учительница.' },
          { lv: 'Mēs esam no Rīgas.', ru: 'Мы из Риги.' },
          { lv: 'Tas ir labs.', ru: 'Это хорошо.' },
        ],
        tip: 'В латышском артиклей нет — «es esmu students» буквально «я есть студент».',
      },
      {
        title: 'Отрицание',
        content: 'Отрицание образуется с «nav» (нет, не есть):',
        examples: [
          { lv: 'Es neesmu', ru: 'Я не (есть)' },
          { lv: 'Viņš nav', ru: 'Он не (есть)' },
          { lv: 'Tā nav patiesa.', ru: 'Это не правда.' },
        ],
      },
    ],
    exercises: [
      {
        id: 'v1',
        type: 'fill',
        question: 'Es ___ students. (я — студент)',
        answer: 'esmu',
        skillIds: ['verb-present'],
      },
      {
        id: 'v2',
        type: 'translate',
        question: 'Переведите: Мы из Риги.',
        answer: 'Mēs esam no Rīgas.',
        skillIds: ['verb-present'],
      },
    ],
  },
  {
    id: 'numbers-1',
    title: 'Числа и время',
    subtitle: 'Skaitļi un laiks',
    level: 'A1',
    category: 'phrases',
    lvaTheme: 'daily',
    duration: 20,
    sections: [
      {
        title: 'Числа 1–10',
        content: 'Выучите базовые числа — они основа для дат, цен и времени.',
        examples: [
          { lv: 'viens, divi, trīs', ru: '1, 2, 3' },
          { lv: 'četri, pieci, seši', ru: '4, 5, 6' },
          { lv: 'septiņi, astoņi, deviņi', ru: '7, 8, 9' },
          { lv: 'desmit', ru: '10' },
        ],
      },
      {
        title: 'Числа 11–20',
        content: 'От eleven до twenty — составные числительные:',
        examples: [
          { lv: 'vienpadsmit', ru: '11' },
          { lv: 'divpadsmit', ru: '12' },
          { lv: 'piecpadsmit', ru: '15' },
          { lv: 'divdesmit', ru: '20' },
        ],
      },
      {
        title: 'Время',
        content: 'Как спросить и сказать время:',
        examples: [
          { lv: 'Cik pulkstenis?', ru: 'Который час?' },
          { lv: 'Pulkstenis ir trīs.', ru: 'Три часа.' },
          { lv: 'Pusaudzis četri', ru: 'Половина пятого (4:30)' },
          { lv: 'ceturtdaļa pēc pieciem', ru: 'Пятнадцать минут шестого' },
        ],
        tip: '«Pulkstenis» буквально означает «часы» (часовой механизм).',
      },
    ],
    exercises: [
      {
        id: 'num1',
        type: 'translate',
        question: 'Как будет «7»?',
        answer: 'septiņi',
      },
      {
        id: 'num2',
        type: 'translate',
        question: 'Переведите: Который час?',
        answer: 'Cik pulkstenis?',
      },
    ],
  },
  {
    id: 'cases-intro',
    title: 'Падежи — введение',
    subtitle: 'Locījumi — первый шаг',
    level: 'A2',
    category: 'grammar',
    lvaTheme: 'education',
    duration: 30,
    sections: [
      {
        title: 'Система падежей',
        content:
          'В латышском 7 падежей (как в русском, но система другая). Каждый падеж отвечает на свой вопрос и используется в определённых ситуациях.',
        examples: [
          { lv: 'Nominatīvs (kas?)', ru: 'Именительный — кто? что?' },
          { lv: 'Ģenitīvs (kā?)', ru: 'Родительный — кого? чего?' },
          { lv: 'Datīvs (kam?)', ru: 'Дательный — кому? чему?' },
          { lv: 'Akuzatīvs (ko?)', ru: 'Винительный — кого? что?' },
          { lv: 'Instruments (ar ko?)', ru: 'Творительный — с кем? с чем?' },
          { lv: 'Lokatīvs (kur?)', ru: 'Местный — где? (только ед.ч.)' },
        ],
      },
      {
        title: 'Пример: māja (дом)',
        content: 'Посмотрите, как меняется слово «дом»:',
        examples: [
          { lv: 'māja', ru: 'дом (кто? что?)' },
          { lv: 'mājas', ru: 'дома (кого? чего?)' },
          { lv: 'mājai', ru: 'дому (кому? чему?)' },
          { lv: 'māju', ru: 'дом (кого? что?)' },
          { lv: 'mājā', ru: 'в доме (где?)' },
        ],
        tip: 'Не пугайтесь! На уровне A1–A2 достаточно знать именительный и винительный.',
      },
    ],
    exercises: [
      {
        id: 'c1',
        type: 'choose',
        question: 'Сколько падежей в латышском?',
        answer: '7',
        options: ['5', '6', '7', '8'],
        skillIds: ['noun-dat-sg', 'noun-acc-sg'],
      },
    ],
  },
  {
    id: 'writing-1',
    title: 'Письменная речь',
    subtitle: 'Burtu rakstīšana un teikumi',
    level: 'A1',
    category: 'writing',
    lvaTheme: 'education',
    duration: 20,
    sections: [
      {
        title: 'Особенности письма',
        content:
          'При письме обязательно используйте правильные диакритические знаки — без них слово может иметь другое значение или быть неправильным.',
        examples: [
          { lv: 'kūka', ru: 'торт' },
          { lv: 'kuka', ru: 'такого слова нет!' },
          { lv: 'zāle', ru: 'зал / трава' },
          { lv: 'zale', ru: 'такого слова нет!' },
        ],
        tip: 'На Windows: Alt+0261 = ā, Alt+0263 = ē. Или переключите раскладку lv.',
      },
      {
        title: 'Порядок слов',
        content: 'Базовый порядок: Подлежащее — Сказуемое — Дополнение (как в русском).',
        examples: [
          { lv: 'Es lasu grāmatu.', ru: 'Я читаю книгу.' },
          { lv: 'Viņa strādā birojā.', ru: 'Она работает в офисе.' },
          { lv: 'Bērni spēlē parkā.', ru: 'Дети играют в парке.' },
        ],
      },
    ],
    exercises: [
      {
        id: 'w1',
        type: 'translate',
        question: 'Напишите по-латышски: Я читаю книгу.',
        answer: 'Es lasu grāmatu.',
      },
    ],
  },
  {
    id: 'culture-1',
    title: 'Латвия и культура',
    subtitle: 'Latvija un kultūra',
    level: 'A1',
    category: 'culture',
    lvaTheme: 'culture',
    duration: 15,
    sections: [
      {
        title: 'О стране',
        content:
          'Латвия — страна Балтии на берегу Балтийского моря. Столица — Рига. Население около 1.9 млн. Официальный язык — латышский.',
        examples: [
          { lv: 'Latvija', ru: 'Латвия' },
          { lv: 'Rīga', ru: 'Рига' },
          { lv: 'latvietis / latviete', ru: 'латыш / латышка' },
          { lv: 'latviešu valoda', ru: 'латышский язык' },
        ],
      },
      {
        title: 'Праздники',
        content: 'Важные даты, когда вы услышите поздравления:',
        examples: [
          { lv: 'Lieldienas', ru: 'Пасха' },
          { lv: 'Jāņi (23. jūnijs)', ru: 'Яни — главный летний праздник' },
          { lv: 'Latvijas Republikas proklamēšanas diena (18. nov.)', ru: 'День независимости' },
          { lv: 'Sveiciens!', ru: 'Поздравление!' },
        ],
        tip: 'Jāņi — это ночь с 23 на 24 июня. Латыши празднуют у костров с песнями и пивом.',
      },
    ],
    exercises: [
      {
        id: 'c1',
        type: 'choose',
        question: 'Как по-латышски «Латвия»?',
        answer: 'Latvija',
        options: ['Latvija', 'Rīga', 'Lietuva', 'Igaunija'],
      },
      {
        id: 'c2',
        type: 'choose',
        question: 'Главный летний праздник латышей:',
        answer: 'Jāņi',
        options: ['Jāņi', 'Lieldienas', 'Ziemassvētki', 'Helovīns'],
      },
      {
        id: 'c3',
        type: 'translate',
        question: 'Напишите по-латышски: латышский язык',
        answer: 'latviešu valoda',
        hint: 'latviešu = латышский, valoda = язык',
      },
    ],
  },
]

export const lessons: Lesson[] = [...coreLessons, ...lessonsExtra]

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id)
}

export const categoryLabels: Record<Lesson['category'], string> = {
  alphabet: 'Алфавит',
  grammar: 'Грамматика',
  phrases: 'Фразы',
  culture: 'Культура',
  writing: 'Письмо',
}

export const levelColors: Record<Lesson['level'], string> = {
  A0: 'text-info',
  A1: 'text-success',
  A2: 'text-gold',
  B1: 'text-accent',
}
