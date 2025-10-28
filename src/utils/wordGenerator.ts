export async function generateWordleWord(): Promise<string> {
    try {
        const response = await fetch('/api/word', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('API Error Details:', data)
            throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`)
        }
    
        if (data.word && data.word.length === 5 && /^[A-Z]+$/.test(data.word)) {
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

function getRandomFallbackWord(): string {
    const fallbackWords = [
        'SLATE', 'CRANE', 'ABORT', 'AUDIO', 'HOUSE', 
        'MOUSE', 'PLANT', 'BREAD', 'CHAIR', 'DANCE',
        'LIGHT', 'SOUND', 'WATER', 'EARTH', 'FLAME',
        'GRAPE', 'JUICE', 'KNIFE', 'LAUGH', 'MAGIC',
        'NURSE', 'OCEAN', 'PIANO', 'QUEEN', 'RADIO'
    ]
  
  const randomWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)]
  return randomWord
}
