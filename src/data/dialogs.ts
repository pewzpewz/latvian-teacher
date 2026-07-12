export type DialogLine = {
  speaker: string
  lv: string
  ru: string
}

export type Dialog = {
  id: string
  title: string
  scene: string
  level: 'A1' | 'A2'
  lines: DialogLine[]
}

export const dialogs: Dialog[] = [
  {
    id: 'd1',
    title: 'В кафе',
    scene: 'Вы заказываете кофе в рижском кафе',
    level: 'A1',
    lines: [
      { speaker: 'Kelneris', lv: 'Labdien! Ko Jūs vēlaties?', ru: 'Добрый день! Что вы желаете?' },
      { speaker: 'Jūs', lv: 'Labdien! Vai man varētu dot kafiju, lūdzu?', ru: 'Добрый день! Можно мне кофе, пожалуйста?' },
      { speaker: 'Kelneris', lv: 'Protams! Ar pienu?', ru: 'Конечно! С молоком?' },
      { speaker: 'Jūs', lv: 'Jā, ar pienu, lūdzu.', ru: 'Да, с молоком, пожалуйста.' },
      { speaker: 'Kelneris', lv: 'Lūdzu, lūk! Tas ir trīs eiro.', ru: 'Пожалуйста, вот! Это три евро.' },
      { speaker: 'Jūs', lv: 'Paldies! Lai jauka diena!', ru: 'Спасибо! Хорошего дня!' },
    ],
  },
  {
    id: 'd2',
    title: 'Знакомство',
    scene: 'Вы знакомитесь с новым коллегой',
    level: 'A1',
    lines: [
      { speaker: 'Kolēģis', lv: 'Sveiki! Es neesmu Tevi redzējis šeit agrāk.', ru: 'Привет! Я тебя раньше здесь не видел.' },
      { speaker: 'Jūs', lv: 'Sveiki! Es esmu jauns šeit. Mani sauc Anna.', ru: 'Привет! Я здесь новенькая. Меня зовут Анна.' },
      { speaker: 'Kolēģis', lv: 'Prieks iepazīties, Anna! Es esmu Jānis.', ru: 'Приятно познакомиться, Анна! Я Янис.' },
      { speaker: 'Jūs', lv: 'Prieks iepazīties! No kurienes Tu esi?', ru: 'Приятно познакомиться! Откуда ты?' },
      { speaker: 'Kolēģis', lv: 'Es esmu no Liepājas. Bet strādāju Rīgā.', ru: 'Я из Лиепаи. Но работаю в Риге.' },
      { speaker: 'Jūs', lv: 'Interesanti! Es esmu no Maskavas.', ru: 'Интересно! Я из Москвы.' },
    ],
  },
  {
    id: 'd3',
    title: 'Как пройти?',
    scene: 'Вы спрашиваете дорогу в Риге',
    level: 'A2',
    lines: [
      { speaker: 'Jūs', lv: 'Atvainojiet, kā es varu aiziet uz Doma laukumu?', ru: 'Извините, как мне пройти к Домской площади?' },
      { speaker: 'Garāmgājējs', lv: 'Ejiet taisni pa šo ielu, tad pagriezieties pa labi.', ru: 'Идите прямо по этой улице, потом поверните направо.' },
      { speaker: 'Jūs', lv: 'Cik tālu tas ir?', ru: 'Как далеко это?' },
      { speaker: 'Garāmgājējs', lv: 'Apmēram piecas minūtes kājām.', ru: 'Примерно пять минут пешком.' },
      { speaker: 'Jūs', lv: 'Liels paldies!', ru: 'Большое спасибо!' },
      { speaker: 'Garāmgājējs', lv: 'Nav par ko! Lai veicas!', ru: 'Не за что! Удачи!' },
    ],
  },
  {
    id: 'd4',
    title: 'В магазине',
    scene: 'Покупки в супермаркете',
    level: 'A1',
    lines: [
      { speaker: 'Jūs', lv: 'Atvainojiet, kur ir maize?', ru: 'Извините, где хлеб?' },
      { speaker: 'Pārdevējs', lv: 'Maize ir tur, otrā rindā.', ru: 'Хлеб там, во втором ряду.' },
      { speaker: 'Jūs', lv: 'Paldies! Un kur ir piens?', ru: 'Спасибо! А где молоко?' },
      { speaker: 'Pārdevējs', lv: 'Piens ir aukstumā, pa labi.', ru: 'Молоко в холодильнике, справа.' },
      { speaker: 'Jūs', lv: 'Labi, paldies par palīdzību!', ru: 'Хорошо, спасибо за помощь!' },
    ],
  },
  {
    id: 'd5',
    title: 'О погоде',
    scene: 'Разговор с соседом',
    level: 'A2',
    lines: [
      { speaker: 'Kaimiņš', lv: 'Sveiki! Jauka diena, vai ne?', ru: 'Привет! Хороший день, правда?' },
      { speaker: 'Jūs', lv: 'Jā, saule spīd! Bet vakar lija.', ru: 'Да, солнце светит! Но вчера шёл дождь.' },
      { speaker: 'Kaimiņš', lv: 'Latvijā laiks mainās ātri.', ru: 'В Латвии погода меняется быстро.' },
      { speaker: 'Jūs', lv: 'Es to jau pamanīju! Vai šodien būs auksti?', ru: 'Я уже заметил! Сегодня будет холодно?' },
      { speaker: 'Kaimiņš', lv: 'Nē, apmēram piecpadsmit grādu. Silti!', ru: 'Нет, примерно пятнадцать градусов. Тепло!' },
    ],
  },
  {
    id: 'd6',
    title: 'На работе',
    scene: 'Разговор с начальником о задаче',
    level: 'A2',
    lines: [
      { speaker: 'Priekšnieks', lv: 'Labrīt! Vai Tu jau redzēji jauno projektu?', ru: 'Доброе утро! Ты уже видел новый проект?' },
      { speaker: 'Jūs', lv: 'Labrīt! Jā, es to apskatīju vakar.', ru: 'Доброе утро! Да, я просмотрел его вчера.' },
      { speaker: 'Priekšnieks', lv: 'Lieliski. Vai Tu vari to pabeigt līdz piektdienai?', ru: 'Отлично. Ты можешь закончить к пятнице?' },
      { speaker: 'Jūs', lv: 'Domāju, ka jā. Ja būs nepieciešams, palūgšu palīdzību.', ru: 'Думаю, да. Если понадобится, попрошу помощи.' },
      { speaker: 'Priekšnieks', lv: 'Labi. Paldies par darbu!', ru: 'Хорошо. Спасибо за работу!' },
    ],
  },
  {
    id: 'd7',
    title: 'У врача',
    scene: 'Запись к врачу и описание симптомов',
    level: 'A2',
    lines: [
      { speaker: 'Medmāsa', lv: 'Labdien! Kas Jums sāp?', ru: 'Добрый день! Что у вас болит?' },
      { speaker: 'Jūs', lv: 'Man jau trīs dienas sāp kakls un ir temperatūra.', ru: 'У меня уже три дня болит горло и есть температура.' },
      { speaker: 'Medmāsa', lv: 'Lūdzu, apsēdieties. Ārsts drīz būs klāt.', ru: 'Пожалуйста, сядьте. Врач скоро будет.' },
      { speaker: 'Ārsts', lv: 'Atveriet muti, lūdzu. Jums ir saaukstēšanās.', ru: 'Откройте рот, пожалуйста. У вас простуда.' },
      { speaker: 'Jūs', lv: 'Vai man vajag zāles?', ru: 'Мне нужны лекарства?' },
      { speaker: 'Ārsts', lv: 'Jā, izrakstīšu recepti. Dzeriet daudz ūdens!', ru: 'Да, выпишу рецепт. Пейте много воды!' },
    ],
  },
  {
    id: 'd8',
    title: 'В банке',
    scene: 'Открытие счёта в латвийском банке',
    level: 'A2',
    lines: [
      { speaker: 'Jūs', lv: 'Labdien! Es vēlos atvērt kontu.', ru: 'Добрый день! Я хотел бы открыть счёт.' },
      { speaker: 'Bankas darbinieks', lv: 'Protams. Vai Jums ir personas kods un pase?', ru: 'Конечно. У вас есть персональный код и паспорт?' },
      { speaker: 'Jūs', lv: 'Jā, lūk, dokumenti.', ru: 'Да, вот документы.' },
      { speaker: 'Bankas darbinieks', lv: 'Paldies. Vai vēlaties arī internetbanku?', ru: 'Спасибо. Хотите также интернет-банк?' },
      { speaker: 'Jūs', lv: 'Jā, lūdzu. Kā es varu saņemt karti?', ru: 'Да, пожалуйста. Как я могу получить карту?' },
      { speaker: 'Bankas darbinieks', lv: 'Karte būs gatava pēc piecām darba dienām.', ru: 'Карта будет готова через пять рабочих дней.' },
    ],
  },
]

export function getDialogById(id: string): Dialog | undefined {
  return dialogs.find((d) => d.id === id)
}
