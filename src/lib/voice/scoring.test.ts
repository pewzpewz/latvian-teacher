import { describe, it, expect } from 'vitest'
import { scoreTranscript, shouldUseGeminiForDialog, VOICE_THRESHOLDS } from './scoring'

describe('voice scoring', () => {
  it('pronunciation mode accepts close match', () => {
    const r = scoreTranscript({
      mode: 'pronunciation',
      expected: 'Labdien!',
      transcript: 'labdien',
    })
    expect(r.accepted).toBe(true)
    expect(r.source).toBe('stt')
    expect(r.score).toBeGreaterThan(80)
  })

  it('dialogTurn uses threshold 0.85', () => {
    expect(VOICE_THRESHOLDS.dialogTurn).toBe(0.85)
    const r = scoreTranscript({
      mode: 'dialogTurn',
      expected: 'paldies',
      transcript: 'paldijs',
    })
    expect(r.accepted).toBe(true)
  })

  it('examSpeaking delegates to checkSpeakingAnswer', () => {
    const r = scoreTranscript({
      mode: 'examSpeaking',
      expected: 'Es esmu students',
      transcript: 'es esmu students',
    })
    expect(r.accepted).toBe(true)
  })

  it('shouldUseGeminiForDialog for short phrases only', () => {
    expect(shouldUseGeminiForDialog('Labdien!')).toBe(true)
    expect(shouldUseGeminiForDialog('Es gribu kafiju ar pienu un cukuru un saldējumu lūdzu')).toBe(false)
  })
})
