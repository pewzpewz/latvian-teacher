/** 7 тем программы Latviešu valodas aģentūra (A0–C2) */

export type LvaTheme =
  | 'identity'
  | 'education'
  | 'environment'
  | 'daily'
  | 'leisure'
  | 'culture'
  | 'science'

export const LVA_THEMES: {
  id: LvaTheme
  title: string
  titleLv: string
  description: string
  order: number
}[] = [
  {
    id: 'identity',
    title: 'Личность и общество',
    titleLv: 'Cilvēka identitāte',
    description: 'Знакомство, семья, национальность, характер',
    order: 1,
  },
  {
    id: 'education',
    title: 'Образование и работа',
    titleLv: 'Izglītība un darbs',
    description: 'Школа, профессии, грамматика, карьера',
    order: 2,
  },
  {
    id: 'environment',
    title: 'Среда обитания',
    titleLv: 'Dzīves vide',
    description: 'Город, транспорт, жильё, природа',
    order: 3,
  },
  {
    id: 'daily',
    title: 'Быт и повседневность',
    titleLv: 'Ikdiena un sadzīve',
    description: 'Еда, покупки, время, домашние дела',
    order: 4,
  },
  {
    id: 'leisure',
    title: 'Досуг и здоровье',
    titleLv: 'Brīvais laiks un veselība',
    description: 'Спорт, хобби, врач, самочувствие',
    order: 5,
  },
  {
    id: 'culture',
    title: 'Культура и традиции',
    titleLv: 'Kultūra un svētki',
    description: 'Праздники, история, искусство Латвии',
    order: 6,
  },
  {
    id: 'science',
    title: 'Наука и технологии',
    titleLv: 'Zinātne un tehnoloģijas',
    description: 'Интернет, техника, путь к B1',
    order: 7,
  },
]

export function getThemeLabel(id: LvaTheme): string {
  return LVA_THEMES.find((t) => t.id === id)?.title ?? id
}
