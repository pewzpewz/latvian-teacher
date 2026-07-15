import { analyzePronunciation } from '../phonemeFeedback'
import { matchPronunciation } from '../pronunciationMatch'
import { checkSpeakingAnswer } from '../examCheck'
import type { PronunciationAssessment, VoiceEvaluateInput, VoiceMode } from './types'

export const VOICE_THRESHOLDS: Record<VoiceMode, number> = {
  pronunciation: 0.9,
  dialogTurn: 0.85,
  examSpeaking: 0.78,
  conversation: 0,
}

export function scoreTranscript(input: VoiceEvaluateInput): PronunciationAssessment {
  const { mode, spoken, expected, keywords } = normalizeInput(input)
  const analysis = analyzePronunciation(spoken, expected)
  const threshold = VOICE_THRESHOLDS[mode]

  let accepted = analysis.accepted
  if (mode === 'examSpeaking') {
    accepted = checkSpeakingAnswer(spoken, expected, keywords)
  } else if (mode === 'dialogTurn') {
    accepted = matchPronunciation(spoken, expected, threshold)
  }

  return {
    score: Math.round(analysis.similarity * 100),
    accepted,
    similarity: analysis.similarity,
    chars: analysis.chars,
    tips: analysis.tips,
    spokenDisplay: analysis.spokenDisplay,
    source: 'stt',
  }
}

function normalizeInput(input: VoiceEvaluateInput) {
  return {
    mode: input.mode,
    spoken: input.transcript.trim(),
    expected: input.expected.trim(),
    keywords: input.keywords,
  }
}

export function shouldUseGeminiForDialog(expected: string): boolean {
  const words = expected.trim().split(/\s+/).filter(Boolean)
  return words.length > 0 && words.length <= 8
}
