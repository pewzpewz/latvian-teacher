export type SkillType = 'grammar' | 'phoneme' | 'vocab-set' | 'topic'

export type Skill = {
  id: string
  type: SkillType
  label: string
  weight: number
  prerequisites?: string[]
}

export const skills: Skill[] = [
  { id: 'phoneme-sh', type: 'phoneme', label: 'š / s', weight: 8 },
  { id: 'phoneme-zh', type: 'phoneme', label: 'ž / z', weight: 6 },
  { id: 'phoneme-ch', type: 'phoneme', label: 'č / c', weight: 7 },
  { id: 'phoneme-long-a', type: 'phoneme', label: 'ā / a', weight: 7 },
  { id: 'phoneme-long-e', type: 'phoneme', label: 'ē / e', weight: 6 },
  { id: 'phoneme-long-i', type: 'phoneme', label: 'ī / i', weight: 6 },
  { id: 'phoneme-long-u', type: 'phoneme', label: 'ū / u', weight: 6 },
  { id: 'phoneme-palatal-g', type: 'phoneme', label: 'ģ / g', weight: 5 },
  { id: 'phoneme-palatal-k', type: 'phoneme', label: 'ķ / k', weight: 5 },
  { id: 'phoneme-palatal-l', type: 'phoneme', label: 'ļ / l', weight: 5 },
  { id: 'phoneme-palatal-n', type: 'phoneme', label: 'ņ / n', weight: 5 },
  { id: 'phoneme-rolled-r', type: 'phoneme', label: 'vibranta r', weight: 9 },
  { id: 'noun-nom-sg', type: 'grammar', label: 'Nominatīvs, viensk.', weight: 7 },
  { id: 'noun-dat-sg', type: 'grammar', label: 'Datīvs, viensk.', weight: 8 },
  { id: 'noun-acc-sg', type: 'grammar', label: 'Akuzatīvs, viensk.', weight: 8 },
  { id: 'verb-present', type: 'grammar', label: 'Tagadne', weight: 9 },
  { id: 'verb-past', type: 'grammar', label: 'Pagātne', weight: 9 },
  { id: 'topic-greetings', type: 'topic', label: 'Sveicieni', weight: 8 },
  { id: 'topic-alphabet', type: 'grammar', label: 'Alfabēts', weight: 10 },
  { id: 'topic-listening', type: 'topic', label: 'Klausīšanās', weight: 9 },
]

const skillById = new Map(skills.map((s) => [s.id, s]))

export function getSkill(id: string): Skill | undefined {
  return skillById.get(id)
}

export function skillLabel(id: string): string {
  return skillById.get(id)?.label ?? id
}

export function skillWeight(id: string): number {
  return skillById.get(id)?.weight ?? 5
}
