import OpenAI from 'openai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🚀 API endpoint called')
  console.log('Method:', req.method)
  console.log('Headers:', req.headers)
  console.log('Environment check:')
  console.log('- Has OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY)
  console.log('- API key starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-'))
  console.log('- API key length:', process.env.OPENAI_API_KEY?.length)

  // CORS headers
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

  // Check environment variable first
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment')
    return res.status(500).json({ 
      error: 'Missing API key',
      debug: 'OPENAI_API_KEY environment variable not set',
      word: 'SLATE' 
    })
  }

  try {
    console.log('🤖 Creating OpenAI client...')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    console.log('📡 Making OpenAI API request...')
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [{
        role: 'user',
        content: 'Generate exactly one random 5-letter English word that would be good for Wordle. Respond with only the word, no other text.'
      }],
      max_tokens: 10,
      temperature: 1,
    })

    console.log('✅ OpenAI responded successfully')
    const word = response.choices[0]?.message?.content?.trim().toUpperCase()
    console.log('Raw word from OpenAI:', word)
    
    if (word && word.length === 5 && /^[A-Z]+$/.test(word)) {
      console.log('✅ Valid word generated:', word)
      return res.json({ word, success: true })
    } else {
      console.log('⚠️ Invalid word from OpenAI, using fallback')
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