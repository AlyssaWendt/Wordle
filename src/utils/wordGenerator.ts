export async function generateWordleWord(): Promise<string> {
    console.log('🌐 Making request to /api/word...')
    try {
        const response = await fetch('/api/word', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        console.log('📡 Response status:', response.status)
        const data = await response.json()
        console.log('📦 Response data:', data)

        if (!response.ok) {
            console.error('API Error Details:', data)
            throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`)
        }
    
        if (data.word && data.word.length === 5 && /^[A-Z]+$/.test(data.word)) {
            console.log('✅ Valid word received:', data.word)
            return data.word
        } else {
            console.warn('⚠️ Invalid word from API, using fallback')
            return getRandomFallbackWord()
        }
    } catch (error) {
        console.error('❌ Error fetching word from API:', error)
        return getRandomFallbackWord()
    }
}

// ✅ Keep your existing fallback words - they work fine
const fallbackWords = [
    'SLATE', 'CRANE', 'ARISE', 'RAISE', 'AUDIO', 'DONUT', 'HOUSE', 
    'PLANT', 'LIGHT', 'SOUND', 'ABORT', 'BREAD', 'CHAIR', 'DANCE'
]

function getRandomFallbackWord(): string {
    return fallbackWords[Math.floor(Math.random() * fallbackWords.length)]
}
