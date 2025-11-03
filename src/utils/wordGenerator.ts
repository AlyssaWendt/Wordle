// ✅ Track used words in browser session
let usedWords = new Set<string>()

const fallbackWords = [
    'SLATE', 'CRANE', 'ARISE', 'RAISE', 'AUDIO', 'DONUT', 'HOUSE', 
    'PLANT', 'LIGHT', 'SOUND', 'ABORT', 'BREAD', 'CHAIR', 'DANCE',
    'EARTH', 'FLAME', 'GRAPE', 'JUICE', 'KNIFE', 'LAUGH', 'MAGIC',
    'NURSE', 'OCEAN', 'PIANO', 'QUEEN', 'ROUND', 'SHARP', 'TABLE'
]

function getRandomFallbackWord(): string {
    const availableWords = fallbackWords.filter(word => !usedWords.has(word))
    
    // Reset if all fallback words used
    if (availableWords.length === 0) {
        console.log('🔄 All fallback words used, resetting session')
        usedWords.clear()
        return fallbackWords[Math.floor(Math.random() * fallbackWords.length)]
    }
    
    const word = availableWords[Math.floor(Math.random() * availableWords.length)]
    usedWords.add(word)
    console.log('📝 Used fallback word:', word, '| Remaining:', availableWords.length - 1)
    
    return word
}

export async function generateWordleWord(): Promise<string> {
    console.log('🌐 Making request to /api/word...')
    try {
        const response = await fetch('/api/word', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })

        const data = await response.json()
        console.log('📦 Response data:', data)

        if (response.ok && data.source === 'openai') {
            // ✅ Check if OpenAI word was already used
            if (usedWords.has(data.word)) {
                console.log('⚠️ OpenAI word already used:', data.word, '- using fallback')
                return getRandomFallbackWord()
            }
            
            console.log('✅ New OpenAI word:', data.word)
            usedWords.add(data.word)
            return data.word
        } else {
            console.warn('⚠️ API failed, using fallback')
            return getRandomFallbackWord()
        }
    } catch (error) {
        console.error('❌ Error fetching word from API:', error)
        return getRandomFallbackWord()
    }
}

// ✅ Export function to reset session if needed
export function resetWordSession(): void {
    usedWords.clear()
    console.log('🔄 Word session reset - all words available again')
}
