export type LiveExamTask = {
  id: string
  step: number
  titleRu: string
  descriptionRu: string
}

export const B1_LIVE_EXAM_TASKS: LiveExamTask[] = [
  {
    id: 'intro',
    step: 1,
    titleRu: 'Представление',
    descriptionRu: 'Имя, откуда вы, чем занимаетесь',
  },
  {
    id: 'daily',
    step: 2,
    titleRu: 'Рассказ о дне',
    descriptionRu: 'Опишите типичный день',
  },
  {
    id: 'topic',
    step: 3,
    titleRu: 'Тема на выбор',
    descriptionRu: 'Путешествие или хобби (1–2 мин)',
  },
  {
    id: 'roleplay',
    step: 4,
    titleRu: 'Ролевая игра',
    descriptionRu: 'Диалог в магазине (хлеб, молоко)',
  },
]

/** Профиль для Live WebSocket — AI ведёт себя как экзаменатор VISC B1. */
export function buildB1LiveExamProfile(extra?: string): string {
  return `Tu esi VISC latviešu valodas B1 mutvārdu eksāmena eksaminators (oficiāls, bet atbalstošs).

STRUKTŪRA — 4 uzdevumi SECĪGI (nelec uz nākamo, kamēr students nav atbildējis):

1. [Uzdevums 1/4] Sāc: "Labdien! Sāksim B1 mutvārdu daļu." Lūdz studentam iepazīstināt sevi (vārds, no kurienes, darbs vai mācības).
2. [Uzdevums 2/4] Īss novērtējums (1 teikums latviski), tad lūdz pastāstīt par savu tipisko dienu.
3. [Uzdevums 3/4] Novērtē, piedāvā izvēli: "Ceļojums" VAI "Hobijs" — students stāsta 1–2 minūtes.
4. [Uzdevums 4/4] Lomas spēle: Tu esi pārdevējs veikalā, students pērk maizi un pienu.

Kad visi 4 uzdevumi pabeigti, OBLIGĀTI raksti:
=== EKSĀMENS BEIDZTS ===
Pēc tam 2–3 teikumi latviski: kopējais vērtējums (labs / viduvējs / jāuzlabo) un viens padoms.

Noteikumi:
- Runā galvenokārt LATVISKI (eksāmena formāts)
- Krievu valodu lieto TIKAI īsiem skaidrojumiem, ja students lūdz
- Katru jaunu uzdevumu sāc ar [Uzdevums N/4]
- Nedod gatavas atbildes — uzdod jautājumus un novērtē
- Esi īss — 2–4 teikumi katrā atbildē, izņemot lomas spēli
${extra ? `\nPapildu konteksts:\n${extra}` : ''}`
}

/** Определяет, какие задания экзаменатор уже объявил по тексту ответа AI. */
export function detectLiveExamProgress(assistantText: string): number {
  let max = 0
  for (let n = 1; n <= 4; n++) {
    const patterns = [
      `[Uzdevums ${n}/4]`,
      `Uzdevums ${n}/4`,
      `uzdevums ${n}`,
    ]
    if (patterns.some((p) => assistantText.toLowerCase().includes(p.toLowerCase()))) {
      max = Math.max(max, n)
    }
  }
  return max
}

export function isLiveExamFinished(assistantText: string): boolean {
  const t = assistantText.toLowerCase()
  return t.includes('eksāmens beidzts') || t.includes('eksamens beidzts')
}
