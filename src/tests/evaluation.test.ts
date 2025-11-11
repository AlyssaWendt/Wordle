import { describe, it, expect } from 'vitest'

// Helper function to test word evaluation logic
function evaluateGuess(target: string, guess: string) {
  const targetArray = target.split('')
  const guessArray = guess.split('')
  const result = new Array(5).fill('absent')
  
  // First pass: Check for correct positions
  for (let i = 0; i < 5; i++) {
    if (guessArray[i] === targetArray[i]) {
      result[i] = 'correct'
      targetArray[i] = '*'
      guessArray[i] = '*'
    }
  }
  
  // Second pass: Check for wrong positions  
  for (let i = 0; i < 5; i++) {
    if (guessArray[i] !== '*') {
      const targetIndex = targetArray.indexOf(guessArray[i])
      if (targetIndex !== -1) {
        result[i] = 'present'
        targetArray[targetIndex] = '*'
      }
    }
  }
  
  return result
}

describe('Word Evaluation Logic', () => {
  it('should mark exact matches as correct', () => {
    const result = evaluateGuess('HOUSE', 'HOUSE')
    expect(result).toEqual(['correct', 'correct', 'correct', 'correct', 'correct'])
  })

  it('should mark wrong letters as absent', () => {
    // HOUSE vs CRANE: 
    // C-absent, R-absent, A-absent, N-absent, E-CORRECT (position 4 matches)
    const result = evaluateGuess('HOUSE', 'CRANE')
    expect(result).toEqual(['absent', 'absent', 'absent', 'absent', 'correct']) // ✅ E is correct, not present
  })

  it('should mark correct letters in wrong positions as present', () => {
    const result = evaluateGuess('HOUSE', 'ESOUH') 
    expect(result).toEqual(['present', 'present', 'present', 'present', 'present'])
  })

  it('should handle duplicate letters correctly', () => {
    const result = evaluateGuess('HOUSE', 'OOOSE')
    expect(result).toEqual(['absent', 'correct', 'absent', 'correct', 'correct'])
  })

  it('should handle complex cases', () => {
    // SPEED vs ERASE:
    // E-present (E exists in SPEED but not position 0)
    // R-absent (R not in SPEED)  
    // A-absent (A not in SPEED)
    // S-present (S exists in SPEED but not position 3)
    // E-present (second E, exists in SPEED)
    const result = evaluateGuess('SPEED', 'ERASE')
    expect(result).toEqual(['present', 'absent', 'absent', 'present', 'present']) // ✅ S is present, not absent
  })

  it('should handle no matches', () => {
    const result = evaluateGuess('HOUSE', 'MAGIC')
    expect(result).toEqual(['absent', 'absent', 'absent', 'absent', 'absent'])
  })

  it('should handle single letter matches', () => {
    const result = evaluateGuess('HOUSE', 'AAAAA')
    expect(result).toEqual(['absent', 'absent', 'absent', 'absent', 'absent'])
  })
})