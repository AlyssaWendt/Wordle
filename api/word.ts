import OpenAI from 'openai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// ===== CONSTANTS =====
const FALLBACK_WORDS = [
    'SLATE', 'CRANE', 'ARISE', 'RAISE', 'DONUT', 
    'AUDIO', 'HOUSE', 'PLANT', 'LIGHT', 'SOUND'
]

const API_TIMEOUT = 3000
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
        console.error('❌ OPENAI_API_KEY not found in environment')
        return res.status(200).json(createSuccessResponse(
            getRandomFallbackWord(), 
            true
        ))
    }

    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })

        // ✅ Add timeout to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('API_TIMEOUT')), API_TIMEOUT)
        )

        const openaiPromise = openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user',
                content: 'One 5-letter word for Wordle:'
            }],
            max_tokens: MAX_TOKENS,
            temperature: 1,
        })

        const response = await Promise.race([openaiPromise, timeoutPromise])
        const word = response.choices[0]?.message?.content?.trim().toUpperCase()

        if (word && isValidWordFormat(word) && isValidWordleWord(word)) {
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
        
        if (err.message === 'API_TIMEOUT') {
            console.warn('⏰ OpenAI API timeout, using fallback')
        } else {
            console.error('❌ OpenAI API error:', err.message)
        }
        return res.status(200).json(createSuccessResponse(
            getRandomFallbackWord(), 
            true
        ))
    }
}