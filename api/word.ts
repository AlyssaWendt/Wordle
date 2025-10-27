import OpenAI from 'openai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: 'Generate exactly one random 5-letter English word that would be good for Wordle. Respond with only the word, no other text.'
      }],
      max_tokens: 10,
      temperature: 1,
    })

    const word = response.choices[0]?.message?.content?.trim().toUpperCase()
    
    if (word && word.length === 5 && /^[A-Z]+$/.test(word)) {
      console.log('Generated word:', word)
      return res.json({ word })
    } else {
      console.log('Invalid word from OpenAI, using fallback')
      return res.json({ word: 'SLATE' })
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    return res.status(500).json({ 
      error: 'Failed to generate word',
      word: 'HOUSE' // Emergency fallback
    })
  }
}