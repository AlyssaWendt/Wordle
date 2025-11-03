import OpenAI from 'openai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// ===== CONSTANTS =====
const FALLBACK_WORDS = [
    'SLATE', 'CRANE', 'ARISE', 'RAISE', 'DONUT', 
    'AUDIO', 'HOUSE', 'PLANT', 'LIGHT', 'SOUND'
]

// ===== HELPER FUNCTIONS =====
function getRandomFallbackWord(): string {
    return FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
}


// ===== MAIN HANDLER =====
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(200).json({ 
            word: getRandomFallbackWord(),
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
            max_tokens: 10,
            temperature: 1,
        })
        
        const word = response.choices[0]?.message?.content?.trim().toUpperCase()

        if (word && word.length === 5 && /^[A-Z]+$/.test(word)) {
            return res.status(200).json({ word })
        } else {
            return res.status(200).json({ 
                word: getRandomFallbackWord(),
                fallback: true 
            })
        }

    } catch (error) {
        console.error('OpenAI API error:', error)
        return res.status(200).json({ 
            word: getRandomFallbackWord(),
            fallback: true 
        })
    }
}
