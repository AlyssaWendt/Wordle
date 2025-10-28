import OpenAI from 'openai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY not found in environment')
        return res.status(500).json({ 
            error: 'Missing API key',
            debug: 'OPENAI_API_KEY environment variable not set',
            word: 'SLATE' 
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
        content: 'Generate exactly one random 5-letter English word that would be good for Wordle. Respond with only the word, no other text.'
        }],
        max_tokens: 10,
        temperature: 1,
    })

    const word = response.choices[0]?.message?.content?.trim().toUpperCase()

    if (word && word.length === 5 && /^[A-Z]+$/.test(word)) {
        return res.json({ word, success: true })
    } else {
        return res.json({ word: 'SLATE', success: true, fallback: true })
    }
    } catch (error) {
        console.error('❌ Error in API:', error)
        const err = error instanceof Error ? error : new Error(String(error))
        console.error('Error name:', err.name)
        console.error('Error message:', err.message)
        console.error('Error stack:', err.stack)

        return res.status(500).json({ 
            error: 'API Error',
            details: err.message,
            type: err.name,
            word: 'HOUSE'
        })
    }
}