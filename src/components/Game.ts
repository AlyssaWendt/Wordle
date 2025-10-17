import { Board } from './Board'
import { Keyboard } from './Keyboard'
import type { TileData, TileStatus } from './Tile'

// ===== TYPES =====
type GameStatus = 'playing' | 'won' | 'lost'

interface GameState {
  currentGuess: string
  guesses: TileData[][]
  gameStatus: GameStatus
  currentRow: number
  targetWord: string
}

// ===== CONSTANTS =====
const WORD_LENGTH = 5
const MAX_GUESSES = 6

// ===== GAME CLASS =====
export class Game {
    private state: GameState
    private board: Board
    private keyboard: Keyboard

    constructor(container: HTMLElement) {
        // Set up initial state
        this.state = {
            currentGuess: '',
            guesses: [],
            gameStatus: 'playing',
            currentRow: 0,
            targetWord: 'DONUT' // Temporary test word - will come from OpenAI later
        }
        
        // Create board and keyboard instances
        this.board = new Board(container)
        this.keyboard = new Keyboard(container, (key) => this.handleKeyPress(key))
        
        // Set up event listeners for physical keyboard
        window.addEventListener('keydown', (e) => this.handleKeyPress(e.key))
        
        // Initial render
        this.updateBoard()
    }



    public handleKeyPress(key: string): void {
        // Only process if game is still playing
        if (this.state.gameStatus !== 'playing') return
        const normalizedKey = key.toUpperCase()

        // Handle letter A-Z
        if (/^[A-Z]$/.test(normalizedKey)) {
            this.addLetter(normalizedKey)
            console.log(`Added letter: ${normalizedKey}, Current guess: ${this.state.currentGuess}`)
            return
        }
        // Handle Enter (use original key, not normalized)
        if (key === 'Enter') {
            this.submitGuess()
            console.log('Submitted guess:', this.state.currentGuess)
            return
        }
        // Handle Backspace (use original key, not normalized)
        if (key === 'Backspace') {
            this.removeLetter()
            console.log('Removed letter, Current guess:', this.state.currentGuess)
            return
        }
        
        // Debug: log unhandled keys
        console.log('Unhandled key:', key, 'normalized:', normalizedKey)
    }

    public removeLetter(): void {
        if (this.state.currentGuess.length === 0) return
        this.state.currentGuess = this.state.currentGuess.slice(0, -1)
        this.updateBoard()
    }

    public reset(): void {
        this.state = {
            currentGuess: '',
            guesses: [],
            gameStatus: 'playing',
            currentRow: 0,
            targetWord: 'DONUT' // Temporary test word - will come from OpenAI later
        }
        this.board.reset()
        this.keyboard.reset()
    }

    public submitGuess(): void {
        console.log('=== SUBMITTING GUESS ===')
        console.log('Current guess:', this.state.currentGuess)
        console.log('Target word:', this.state.targetWord)
        console.log('Guess length:', this.state.currentGuess.length)
        
        if (this.state.currentGuess.length !== WORD_LENGTH) {
            console.log('❌ Guess too short/long, need', WORD_LENGTH, 'letters')
            return
        }
        
        if (!this.isValidWord(this.state.currentGuess)) {
            console.log('❌ Invalid word:', this.state.currentGuess)
            alert('Not a valid word')
            return
        }

        console.log('✅ Valid guess, evaluating...')
        const evaluation = this.evaluateGuess(this.state.currentGuess)
        console.log('Evaluation result:', evaluation)
        
        const guessTiles: TileData[] = this.state.currentGuess.split('').map((letter, idx) => ({
            letter,
            status: evaluation[idx]
        }))
        
        console.log('Created tiles:', guessTiles)

        this.state.guesses.push(guessTiles)
        console.log('Updated guesses array:', this.state.guesses)
        
        this.updateBoard()
        this.updateKeyboard()
        console.log('Updated board and keyboard')

        if (this.checkWinCondition()) {
            console.log('🎉 WIN CONDITION MET!')
            this.state.gameStatus = 'won'  
            alert('Congratulations! You won!')
        } else if (this.checkLoseCondition()) {
            console.log('💀 LOSE CONDITION MET!')
            this.state.gameStatus = 'lost'
            alert(`Game Over! The word was ${this.state.targetWord}`)
        } else {
            console.log('Game continues...')
            this.state.currentRow++
            this.state.currentGuess = ''
            console.log('New current row:', this.state.currentRow)
            console.log('Reset current guess:', this.state.currentGuess)
        }
        console.log('=== END SUBMIT GUESS ===\n')
    }

    // ===== PUBLIC METHODS =====
    public addLetter(letter: string): void {
        if (this.state.currentGuess.length >= WORD_LENGTH) return
        if (this.state.gameStatus !== 'playing') return
        
        this.state.currentGuess += letter.toUpperCase()
        this.updateBoard()
    }

    // ===== PRIVATE METHODS =====
    private updateBoard(): void {
        this.board.render(
            this.state.guesses, 
            this.state.currentGuess, 
            this.state.currentRow
        )
    }

    private updateKeyboard(): void {
        // Update keyboard with letter statuses from the last guess
        const lastGuess = this.state.guesses[this.state.guesses.length - 1]
        if (lastGuess) {
            const keyUpdates = lastGuess.map(tile => ({
                letter: tile.letter,
                status: tile.status
            }))
            this.keyboard.updateMultipleKeys(keyUpdates)
        }
    }

    private evaluateGuess(guess: string): TileStatus[] {
        console.log('--- EVALUATING GUESS ---')
        console.log('Guess:', guess, '→', guess.split(''))
        console.log('Target:', this.state.targetWord, '→', this.state.targetWord.split(''))
        
        const targetArray = this.state.targetWord.split('')
        const guessArray = guess.split('')
        const result: TileStatus[] = new Array(WORD_LENGTH).fill('absent')
        
        console.log('Initial result (all absent):', result)
        
        // First pass: mark correct letters
        console.log('FIRST PASS - Finding exact matches:')
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guessArray[i] === targetArray[i]) {
                result[i] = 'correct'
                console.log(`  Position ${i}: ${guessArray[i]} = ${targetArray[i]} → CORRECT`)
                targetArray[i] = '*' // Mark as used
                guessArray[i] = '*' // Mark as processed
            } else {
                console.log(`  Position ${i}: ${guessArray[i]} ≠ ${targetArray[i]} → checking later`)
            }
        }
        
        console.log('After first pass:')
        console.log('  Result:', result)
        console.log('  Remaining target letters:', targetArray)
        console.log('  Remaining guess letters:', guessArray)
        
        // Second pass: mark present letters
        console.log('SECOND PASS - Finding wrong position matches:')
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guessArray[i] !== '*') {
                const targetIndex = targetArray.indexOf(guessArray[i])
                if (targetIndex !== -1) {
                    result[i] = 'present'
                    console.log(`  Position ${i}: ${guessArray[i]} found at target[${targetIndex}] → PRESENT`)
                    targetArray[targetIndex] = '*' // Mark as used
                } else {
                    console.log(`  Position ${i}: ${guessArray[i]} not found → ABSENT`)
                }
            }
        }
        
        console.log('Final result:', result)
        console.log('--- END EVALUATION ---')
        return result
    }

    private isValidWord(word: string): boolean {
        // For now, just check length - later connect to word API
        return word.length === WORD_LENGTH && /^[A-Z]+$/.test(word)
    }

    private checkWinCondition(): boolean {
        return this.state.currentGuess.toUpperCase() === this.state.targetWord.toUpperCase()
    }

    private checkLoseCondition(): boolean {
        return this.state.currentRow >= MAX_GUESSES - 1
    }

}