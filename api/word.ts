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
            messages: [{
                role: 'user',
                content: 'Generate exactly one 5-letter English word for a Wordle game. Respond with only the word, no explanation.'
            }],
            max_tokens: 3,
            temperature: 0.8,
        })
        
        const rawResponse = response.choices[0]?.message?.content
        console.log('🤖 OpenAI raw response:', JSON.stringify(rawResponse))

        // Extract the first 5-letter word from the response
        const words = rawResponse?.match(/[A-Za-z]{5}/g) // Find all 5-letter words
        const word = words?.[0]?.toUpperCase()

        console.log('🔤 Extracted word:', word)
        console.log('🔤 Word length:', word?.length)

        if (word && word.length === 5) {
            console.log('✅ Validation passed, returning:', word)
            return res.status(200).json({ word, source: 'openai' })
        } else {
            console.log('❌ No valid word found in response')
            return res.status(422).json({ 
                error: 'Invalid word generated',
                debug: { rawResponse, extractedWords: words }
            })
        }

    } catch (error) {
        console.error('OpenAI API error:', error)
        return res.status(500).json({ error: 'OpenAI service unavailable' })
    }
}
