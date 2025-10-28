import OpenAI from 'openai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log('🚀 Validation API endpoint called')
    console.log('Method:', req.method)
    console.log('Body:', req.body)

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { word } = req.body

    if (!word || typeof word !== 'string') {
        console.log('❌ No valid word provided')
        return res.status(400).json({ error: 'Word is required' })
    }

    console.log('✅ Validating word:', word)

    // Check environment variable
    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY not found')
        return res.json({ 
            word: word.toUpperCase(),
            isValid: false,
            message: 'API key missing - word rejected',
            fallback: true
        })
    }

    try {
        console.log('🤖 Calling OpenAI to validate...')
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `"${word.toUpperCase()}" - valid English word? Y/N` // Shorter prompt
            }],
            max_tokens: 1,
            temperature: 0,
        })

        const aiResponse = response.choices[0]?.message?.content?.trim().toUpperCase()
        const isValid = aiResponse?.startsWith('Y') // Check for Y/YES
        
        console.log(`✅ OpenAI says "${word}" is:`, aiResponse, '→', isValid)
        
        return res.json({ 
            word: word.toUpperCase(),
            isValid,
            message: isValid ? 'Valid word' : 'Not a valid word',
            aiResponse
        })
    } catch (error) {
        console.error('❌ OpenAI validation error:', error)
        
        const errorMessage = error instanceof Error ? error.message : String(error)
        
        return res.json({ 
            word: word.toUpperCase(),
            isValid: false,
            message: 'Unable to validate word - please try a different word',
            fallback: true,
            error: errorMessage
        })
    }
}