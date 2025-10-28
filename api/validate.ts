import OpenAI from 'openai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log('🚀 Validation API endpoint called')
    console.log('Method:', req.method)
    console.log('Environment check:')
    console.log('- Has OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY)
    console.log('- API key starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-'))

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        console.log('✅ OPTIONS request handled')
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        console.log('❌ Wrong method:', req.method)
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { word } = req.body

    if (!word || typeof word !== 'string') {
        console.log('❌ No valid word provided in request body')
        return res.status(400).json({ error: 'Word is required' })
    }

    console.log('✅ Received word to validate:', word)

    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY not found in environment')
        return res.status(500).json({ 
            error: 'Missing API key',
            word: word.toUpperCase(),
        })
    }

    try {
        console.log('🤖 Validating with OpenAI...')
        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [{
                role: 'user',
                content: `Is "${word.toUpperCase()}" a valid English word that would be acceptable in Wordle? Consider common English words, proper nouns are not allowed. Respond with only "YES" or "NO".`
            }],
            max_tokens: 5,
            temperature: 0,
        })

        const isValid = response.choices[0]?.message?.content?.trim().toUpperCase() === 'YES'
        console.log(`✅ Word validation result for "${word}":`, isValid)
        
        return res.json({ 
            word: word.toUpperCase(),
            isValid,
            message: isValid ? 'Valid word' : 'Not a valid word'
        })
    } catch (error) {
        console.error('❌ Validation error:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('Error details:', errorMessage)
        
        return res.json({ 
            word: word.toUpperCase(),
            isValid: true,
            message: 'Could not validate - assuming valid',
            fallback: true
        })
    }
}