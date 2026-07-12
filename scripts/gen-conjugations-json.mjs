/**
 * Generate content/conjugations.json — 7 verbs × 6 persons = 42 drills
 * Run: node scripts/gen-conjugations-json.mjs
 */
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const PERSONS = [
  { id: '1sg', pronoun: 'es', labelRu: '1 л. ед. (es)' },
  { id: '2sg', pronoun: 'tu', labelRu: '2 л. ед. (tu)' },
  { id: '3sg', pronoun: 'viņš/viņa', labelRu: '3 л. ед. (viņš/viņa)' },
  { id: '1pl', pronoun: 'mēs', labelRu: '1 л. мн. (mēs)' },
  { id: '2pl', pronoun: 'jūs', labelRu: '2 л. мн. (jūs)' },
  { id: '3pl', pronoun: 'viņi/viņas', labelRu: '3 л. мн. (viņi/viņas)' },
]

const VERBS = [
  {
    slug: 'but',
    lemma: 'būt',
    lemmaRu: 'быть',
    group: 'irregular',
    forms: ['esmu', 'esi', 'ir', 'esam', 'esat', 'ir'],
    hint: 'Неправильный глагол — выучите наизусть',
    sentences: [
      { lv: 'Es esmu students.', ru: 'Я студент.' },
      { lv: 'Tu esi laimīgs.', ru: 'Ты счастлив.' },
      { lv: 'Viņa ir skolotāja.', ru: 'Она учительница.' },
      { lv: 'Mēs esam no Rīgas.', ru: 'Мы из Риги.' },
      { lv: 'Jūs esat viesi.', ru: 'Вы гости.' },
      { lv: 'Viņi ir draugi.', ru: 'Они друзья.' },
    ],
  },
  {
    slug: 'iet',
    lemma: 'iet',
    lemmaRu: 'идти',
    group: 'irregular',
    forms: ['eju', 'ej', 'iet', 'ejam', 'ejat', 'iet'],
    hint: 'Корень меняется: eju, ej…',
    sentences: [
      { lv: 'Es eju uz skolu.', ru: 'Я иду в школу.' },
      { lv: 'Tu ej mājās.', ru: 'Ты идёшь домой.' },
      { lv: 'Viņš iet pa ielu.', ru: 'Он идёт по улице.' },
      { lv: 'Mēs ejam uz parku.', ru: 'Мы идём в парк.' },
      { lv: 'Jūs ejat ātri.', ru: 'Вы идёте быстро.' },
      { lv: 'Viņi iet uz darbu.', ru: 'Они идут на работу.' },
    ],
  },
  {
    slug: 'runat',
    lemma: 'runāt',
    lemmaRu: 'говорить',
    group: 'conj1',
    forms: ['runāju', 'runā', 'runā', 'runājam', 'runājat', 'runā'],
    hint: 'I спряжение (-āt): -āju, -ā, -ājam…',
    sentences: [
      { lv: 'Es runāju latviski.', ru: 'Я говорю по-латышски.' },
      { lv: 'Tu runā skaidri.', ru: 'Ты говоришь ясно.' },
      { lv: 'Viņa runā ar mani.', ru: 'Она говорит со мной.' },
      { lv: 'Mēs runājam par darbu.', ru: 'Мы говорим о работе.' },
      { lv: 'Jūs runājat angliski.', ru: 'Вы говорите по-английски.' },
      { lv: 'Viņi runā klusi.', ru: 'Они говорят тихо.' },
    ],
  },
  {
    slug: 'lasit',
    lemma: 'lasīt',
    lemmaRu: 'читать',
    group: 'conj2',
    forms: ['lasu', 'lasi', 'lasa', 'lasām', 'lasāt', 'lasa'],
    hint: 'II спряжение (-īt): -u, -i, -a, -ām…',
    sentences: [
      { lv: 'Es lasu grāmatu.', ru: 'Я читаю книгу.' },
      { lv: 'Tu lasi avīzi.', ru: 'Ты читаешь газету.' },
      { lv: 'Viņš lasa ziņas.', ru: 'Он читает новости.' },
      { lv: 'Mēs lasām kopā.', ru: 'Мы читаем вместе.' },
      { lv: 'Jūs lasāt daudz.', ru: 'Вы много читаете.' },
      { lv: 'Viņi lasa pirms miega.', ru: 'Они читают перед сном.' },
    ],
  },
  {
    slug: 'stradat',
    lemma: 'strādāt',
    lemmaRu: 'работать',
    group: 'conj1',
    forms: ['strādāju', 'strādā', 'strādā', 'strādājam', 'strādājat', 'strādā'],
    hint: 'I спряжение (-āt)',
    sentences: [
      { lv: 'Es strādāju birojā.', ru: 'Я работаю в офисе.' },
      { lv: 'Tu strādā mājās.', ru: 'Ты работаешь дома.' },
      { lv: 'Viņa strādā skolā.', ru: 'Она работает в школе.' },
      { lv: 'Mēs strādājam kopā.', ru: 'Мы работаем вместе.' },
      { lv: 'Jūs strādājat smagi.', ru: 'Вы тяжело работаете.' },
      { lv: 'Viņi strādā rūpnīcā.', ru: 'Они работают на заводе.' },
    ],
  },
  {
    slug: 'macities',
    lemma: 'mācīties',
    lemmaRu: 'учиться',
    group: 'reflexive',
    forms: ['mācos', 'mācies', 'mācās', 'mācāmies', 'mācaties', 'mācās'],
    hint: 'Возвратный: -os, -ies, -ās, -āmies…',
    sentences: [
      { lv: 'Es mācos latviešu valodu.', ru: 'Я учу латышский язык.' },
      { lv: 'Tu mācies katru dienu.', ru: 'Ты учишься каждый день.' },
      { lv: 'Viņš mācās universitātē.', ru: 'Он учится в университете.' },
      { lv: 'Mēs mācāmies kopā.', ru: 'Мы учимся вместе.' },
      { lv: 'Jūs mācaties ātri.', ru: 'Вы учитесь быстро.' },
      { lv: 'Viņi mācās skolā.', ru: 'Они учатся в школе.' },
    ],
  },
  {
    slug: 'smieties',
    lemma: 'smieties',
    lemmaRu: 'смеяться',
    group: 'reflexive',
    forms: ['smejos', 'smejies', 'smejas', 'smejamies', 'smejaties', 'smejas'],
    hint: 'Возвратный глагол на -ties',
    sentences: [
      { lv: 'Es smejos.', ru: 'Я смеюсь.' },
      { lv: 'Tu smejies par joku.', ru: 'Ты смеёшься над шуткой.' },
      { lv: 'Viņa smejas skaļi.', ru: 'Она громко смеётся.' },
      { lv: 'Mēs smejamies kopā.', ru: 'Мы смеёмся вместе.' },
      { lv: 'Jūs smejaties laimīgi.', ru: 'Вы счастливо смеётесь.' },
      { lv: 'Viņi smejas par filmu.', ru: 'Они смеются над фильмом.' },
    ],
  },
]

const drills = []

for (const verb of VERBS) {
  PERSONS.forEach((p, i) => {
    drills.push({
      id: `${verb.slug}-${p.id}`,
      lemma: verb.lemma,
      lemmaRu: verb.lemmaRu,
      group: verb.group,
      tense: 'present',
      person: p.id,
      pronoun: p.pronoun,
      form: verb.forms[i],
      promptRu: `Настоящее время, ${p.labelRu}: ${verb.lemmaRu}`,
      hint: verb.hint,
      sentence: verb.sentences[i],
    })
  })
}

writeFileSync(join(root, 'content/conjugations.json'), JSON.stringify(drills, null, 2) + '\n')
console.log(`conjugations.json ← ${drills.length} drills`)
