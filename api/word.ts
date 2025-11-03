import OpenAI from 'openai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// ===== CONSTANTS =====
const FALLBACK_WORDS = [
    'SLATE', 'CRANE', 'ARISE', 'RAISE', 'DONUT', 
    'AUDIO', 'HOUSE', 'PLANT', 'LIGHT', 'SOUND'
]

const MAX_TOKENS = 5

// ===== HELPER FUNCTIONS =====
function getRandomFallbackWord(): string {
    return FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
}

function isValidWordFormat(word: string | null | undefined): boolean {
    return word !== null && word !== undefined && word.length === 5 && /^[A-Z]+$/.test(word)
}

function isValidWordleWord(word: string | null | undefined): boolean {
    if (!word || typeof word !== 'string') {
        return false
    }

    if (word.length !== 5 || !/^[A-Z]+$/.test(word)) {
        return false
    }
    
    // Avoid common edge cases
    const invalidPatterns = [
        /^[A-Z]{5}S$/,
        /^[A-Z]*[0-9]/,
        /^(NASA|LASER|SCUBA|RADAR)$/,
    ]
    
    return !invalidPatterns.some(pattern => pattern.test(word))
}

function createSuccessResponse(word: string, fallback = false): object {
    return {
        word,
        success: true,
        ...(fallback && { fallback: true, source: 'curated' })
    }
}

function createErrorResponse(error: string, fallbackWord: string): object {
    return {
        error,
        word: fallbackWord,
        success: false,
        fallback: true,
        source: 'error_fallback'
    }
}

// ===== MAIN HANDLER =====
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Cache-Control', 'no-cache')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json(createErrorResponse(
            'Method not allowed', 
            getRandomFallbackWord()
        ))
    }

    if (!process.env.OPENAI_API_KEY) {
        console.log('❌ No API key - returning fallback') // Are you seeing this?
        return res.status(200).json({
            word: getRandomFallbackWord(),
            success: true,
            fallback: true
        })
    }

    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user',
                content: 'One 5-letter word for Wordle:'
            }],
            max_tokens: 5,
            temperature: 1,
        })
        
        const word = response.choices[0]?.message?.content?.trim().toUpperCase()

        if (!word) {
            console.warn('⚠️ No word received from API')
            return res.status(200).json(createSuccessResponse(
                getRandomFallbackWord(), 
                true
            ))
        }

        if (isValidWordFormat(word) && isValidWordleWord(word)) {
            console.log('✅ Generated word:', word)
            return res.status(200).json(createSuccessResponse(word))
        } else {
            console.warn('⚠️ Invalid word format from API:', word)
            return res.status(200).json(createSuccessResponse(
                getRandomFallbackWord(), 
                true
            ))
        }

    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        console.error('❌ OpenAI API error:', err.message)
        
        return res.status(200).json(createSuccessResponse(
            getRandomFallbackWord(), 
            true
        ))
    }
}

// Test fetch code - to be removed in production
fetch('/api/word', { method: 'POST', headers: { 'Content-Type': 'application/json' }})
  .then(r => r.json())
  .then(data => {
    console.log('🔍 Direct API test result:', data)
    if (data.fallback) {
      console.log('❌ API is returning fallback words - check API key')
    } else {
      console.log('✅ API is working - check game logic')
    }
  })