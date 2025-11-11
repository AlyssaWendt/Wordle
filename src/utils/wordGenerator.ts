let usedWords = new Set<string>()

const fallbackWords = [
    'SLATE', 'CRANE', 'ARISE', 'RAISE', 'AUDIO', 'DONUT', 'HOUSE', 
    'PLANT', 'LIGHT', 'SOUND', 'ABORT', 'BREAD', 'CHAIR', 'DANCE',
    'EARTH', 'FLAME', 'GRAPE', 'JUICE', 'KNIFE', 'LAUGH', 'MAGIC',
    'NURSE', 'OCEAN', 'PIANO', 'QUEEN', 'ROUND', 'SHARP', 'TABLE'
]

function getRandomFallbackWord(): string {
    const availableWords = fallbackWords.filter(word => !usedWords.has(word))
    
    if (availableWords.length === 0) {
        usedWords.clear()
        return fallbackWords[Math.floor(Math.random() * fallbackWords.length)]
    }
    
    const word = availableWords[Math.floor(Math.random() * availableWords.length)]
    usedWords.add(word)
    
    return word
}

export async function generateWordleWord(): Promise<string> {
    try {
        const response = await fetch('/api/word', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })

        const data = await response.json()

        if (response.ok && data.source === 'openai') {
            if (usedWords.has(data.word)) {
                return getRandomFallbackWord()
            }
            
            usedWords.add(data.word)
            return data.word
        } else {
            return getRandomFallbackWord()
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching word from API:', error)
        }
        return getRandomFallbackWord()
    }
}

export function resetWordSession(): void {
    usedWords.clear()
}
