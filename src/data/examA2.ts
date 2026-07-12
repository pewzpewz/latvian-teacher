import type { ExamQuestion, ExamSection } from './examB1'

export const examA2Sections: ExamSection[] = [
  {
    id: 'a2-reading-1',
    title: 'Чтение — знакомство',
    type: 'reading',
    description: 'Простой диалог уровня A2: представление, семья, работа.',
    timeMinutes: 10,
    questions: [
      {
        id: 'a2-r1',
        type: 'choose',
        passage:
          'Sveiki! Mani sauc Anna. Es esmu no Lietuvas, bet dzīvoju Rīgā jau trīs gadus. Es strādāju veikalā un mācos latviešu valodu vakaros.',
        question: 'Kur Anna strādā?',
        answer: 'Veikalā',
        options: ['Veikalā', 'Skolā', 'Slimnīcā', 'Bankā'],
      },
      {
        id: 'a2-r2',
        type: 'choose',
        passage:
          'Sveiki! Mani sauc Anna. Es esmu no Lietuvas, bet dzīvoju Rīgā jau trīs gadus.',
        question: 'Cik ilgi Anna dzīvo Rīgā?',
        answer: 'Trīs gadus',
        options: ['Vienu gadu', 'Trīs gadus', 'Desmit gadus', 'Mēnesi'],
      },
      {
        id: 'a2-r3',
        type: 'choose',
        passage: 'Es mācos latviešu valodu vakaros.',
        question: 'Kad Anna mācās valodu?',
        answer: 'Vakaros',
        options: ['No rīta', 'Vakaros', 'Nekad', 'Tikai brīvdienās'],
      },
      {
        id: 'a2-r4',
        type: 'choose',
        question: 'No kuras valsts Anna ir?',
        answer: 'Lietuvas',
        options: ['Latvijas', 'Lietuvas', 'Igaunijas', 'Polijas'],
        passage:
          'Sveiki! Mani sauc Anna. Es esmu no Lietuvas, bet dzīvoju Rīgā jau trīs gadus.',
      },
    ],
  },
  {
    id: 'a2-reading-2',
    title: 'Чтение — расписание',
    type: 'reading',
    description: 'Понимание простого расписания и объявлений — типично для A2.',
    timeMinutes: 8,
    questions: [
      {
        id: 'a2-r5',
        type: 'choose',
        passage:
          'VALODAS KURSI: A1 grupa — pirmdienās un trešdienās no 18:00 līdz 20:00. A2 grupa — otrdienās un ceturtdienās no 18:00 līdz 20:00. Nodarbības notiek Brīvības ielā 45.',
        question: 'Kad ir A2 grupa?',
        answer: 'Otrdienās un ceturtdienās',
        options: [
          'Pirmdienās un trešdienās',
          'Otrdienās un ceturtdienās',
          'Tikai sestdienās',
          'Katru dienu no rīta',
        ],
      },
      {
        id: 'a2-r6',
        type: 'choose',
        passage:
          'VALODAS KURSI: A1 grupa — pirmdienās un trešdienās no 18:00 līdz 20:00. Nodarbības notiek Brīvības ielā 45.',
        question: 'Cikos sākas nodarbības?',
        answer: '18:00',
        options: ['8:00', '12:00', '18:00', '21:00'],
      },
      {
        id: 'a2-r7',
        type: 'choose',
        passage: 'Nodarbības notiek Brīvības ielā 45.',
        question: 'Kur notiek nodarbības?',
        answer: 'Brīvības ielā 45',
        options: ['Brīvības ielā 45', 'Railway station', 'Centrāltirgū', 'Lidostā'],
      },
    ],
  },
  {
    id: 'a2-grammar-1',
    title: 'Грамматика A2 — основы',
    type: 'grammar',
    description: 'būt, числа, простые падежи и базовая лексика.',
    timeMinutes: 12,
    questions: [
      {
        id: 'a2-g1',
        type: 'fill',
        question: 'Es ___ students. (я — студент)',
        answer: 'esmu',
        hint: 'Глагол būt, 1 л. ед.',
      },
      {
        id: 'a2-g2',
        type: 'choose',
        question: 'Выберите правильный перевод: «У меня два брата»',
        answer: 'Man ir divi brāļi.',
        options: [
          'Man ir divi brāļi.',
          'Man divi brāļi.',
          'Es ir divi brāļi.',
          'Man ir divus brāļi.',
        ],
      },
      {
        id: 'a2-g3',
        type: 'fill',
        question: 'Labdien! ___ Anna. (меня зовут)',
        answer: 'Mani sauc',
        hint: 'Mani sauc + vārds',
      },
      {
        id: 'a2-g4',
        type: 'choose',
        question: 'Antonīms vārdam «liels» (большой):',
        answer: 'mazs',
        options: ['mazs', 'labs', 'jauns', 'ātrs'],
      },
      {
        id: 'a2-g5',
        type: 'translate',
        question: 'Переведите: «Спасибо, до свидания!»',
        answer: 'Paldies, uz redzēšanos!',
        hint: 'Paldies + uz redzēšanos',
      },
    ],
  },
]

export function getExamA2Section(id: string): ExamSection | undefined {
  return examA2Sections.find((s) => s.id === id)
}

export type { ExamQuestion }
