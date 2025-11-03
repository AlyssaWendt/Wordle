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
                content: 'One 5-letter word for Wordle:'
            }],
            max_tokens: 10,
            temperature: 1,
        })
        
        // ✅ Add these debug logs
        const rawResponse = response.choices[0]?.message?.content
        console.log('🤖 OpenAI raw response:', JSON.stringify(rawResponse))
        console.log('🤖 Raw response length:', rawResponse?.length)

        const word = rawResponse?.trim().toUpperCase()
        console.log('🔤 Processed word:', JSON.stringify(word))
        console.log('🔤 Word length:', word?.length)
        console.log('🔤 Regex test:', word ? /^[A-Z]+$/.test(word) : false)

        if (word && word.length === 5 && /^[A-Z]+$/.test(word)) {
            console.log('✅ Validation passed, returning:', word)
            return res.status(200).json({ word, source: 'openai' })
        } else {
            console.log('❌ Validation failed!')
            console.log('❌ Word exists:', !!word)
            console.log('❌ Length is 5:', word?.length === 5)
            console.log('❌ Regex passes:', word ? /^[A-Z]+$/.test(word) : false)
            return res.status(422).json({ 
                error: 'Invalid word generated',
                debug: { rawResponse, word, length: word?.length }
            })
        }

    } catch (error) {
        console.error('OpenAI API error:', error)
        return res.status(500).json({ error: 'OpenAI service unavailable' })
    }
}
