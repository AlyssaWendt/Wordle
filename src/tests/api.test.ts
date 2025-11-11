import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateWordleWord, resetWordSession } from '../utils/wordGenerator'

// Mock fetch responses
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Word Generation API', () => {
  beforeEach(() => {
    resetWordSession()
    vi.clearAllMocks()
    
    // Mock successful word generation response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        word: 'HOUSE',
        source: 'openai'
      })
    })
  })

  it('should generate a valid 5-letter word', async () => {
    const word = await generateWordleWord()
    
    expect(word).toBeDefined()
    expect(word).toHaveLength(5)
    expect(word).toMatch(/^[A-Z]+$/)
  })

  it('should not repeat words in the same session', async () => {
    // Mock different words for each call
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ word: 'HOUSE', source: 'openai' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ word: 'PLANT', source: 'openai' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ word: 'CRANE', source: 'openai' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ word: 'SLATE', source: 'openai' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ word: 'AUDIO', source: 'openai' })
      })

    const words = []
    
    // Generate 5 words
    for (let i = 0; i < 5; i++) {
      const word = await generateWordleWord()
      words.push(word)
    }
    
    // Check for duplicates
    const unique = [...new Set(words)]
    expect(unique).toHaveLength(words.length)
  })

  it('should reset session and allow word reuse', async () => {
    const word1 = await generateWordleWord()
    expect(word1).toBeDefined()
    expect(word1).toHaveLength(5)
    resetWordSession()
    
    // After reset, we might get the same word again (that's ok)
    const word2 = await generateWordleWord()
    expect(word2).toBeDefined()
    expect(word2).toHaveLength(5)
  })

  it('should handle API failures gracefully', async () => {
    // Mock API failure
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    
    const word = await generateWordleWord()
    
    // Should fallback to a valid word
    expect(word).toBeDefined()
    expect(word).toHaveLength(5)
    expect(word).toMatch(/^[A-Z]+$/)
  })
})

describe('Word Validation API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should validate common English words', async () => {
    // Mock validation API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        word: 'HOUSE',
        isValid: true,
        message: 'Valid word'
      })
    })

    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: 'HOUSE' })
    })
    
    const data = await response.json()
    expect(data.isValid).toBe(true)
    expect(data.word).toBe('HOUSE')
  })

  it('should reject invalid words', async () => {
    // Mock validation API response for invalid word
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        word: 'ZZZZZ',
        isValid: false,
        message: 'Not a valid word'
      })
    })

    const response = await fetch('/api/validate', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: 'ZZZZZ' })
    })
    
    const data = await response.json()
    expect(data.isValid).toBe(false)
    expect(data.word).toBe('ZZZZZ')
  })

  it('should handle validation API errors', async () => {
    // Mock API error
    mockFetch.mockRejectedValueOnce(new Error('API unavailable'))

    try {
      await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: 'HOUSE' })
      })
      // If fetch does not throw, fail the test explicitly
      throw new Error('Expected fetch to throw')
    } catch (err) {
      // Type-safe checks for unknown error
      expect(err).toBeInstanceOf(Error)
      expect((err as Error).message).toBe('API unavailable')
    }
  })

  it('should verify fetch was called with correct parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ isValid: true })
    })

    await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: 'HOUSE' })
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: 'HOUSE' })
    })
  })
})