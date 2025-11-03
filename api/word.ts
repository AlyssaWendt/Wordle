import OpenAI from 'openai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' })
    }

    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You generate 5-letter English words for Wordle. Respond with ONLY the word. No punctuation, no explanation, no extra text.'
                },
                {
                    role: 'user',
                    content: 'Generate word'
                }
            ],
            max_tokens: 2,
            temperature: 0.8,
            frequency_penalty: 0.5,
        })
        
        const rawResponse = response.choices[0]?.message?.content
        const word = rawResponse?.trim().toUpperCase()

        // Simple validation since prompt should ensure clean response
        if (word && word.length === 5 && /^[A-Z]+$/.test(word)) {
            return res.status(200).json({ word, source: 'openai' })
        } else {
            return res.status(422).json({ 
                error: 'Invalid word generated',
                debug: { rawResponse, word }
            })
        }

    } catch (error) {
        console.error('OpenAI API error:', error)
        return res.status(500).json({ error: 'OpenAI service unavailable' })
    }
}
