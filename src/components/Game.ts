import { Board } from './Board'
import { Keyboard } from './Keyboard'
import { Message } from './Message'
import type { TileData, TileStatus } from './Tile'
import { generateWordleWord } from '../utils/wordGenerator'

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
    private message: Message
    private nextApiWord?: string

    constructor(container: HTMLElement) {
        this.state = {
            currentGuess: '',
            guesses: [],
            gameStatus: 'playing',
            currentRow: 0,
            targetWord: this.getInstantWord()
        }

        this.board = new Board(container)
        this.keyboard = new Keyboard(container, (key) => this.handleKeyPress(key))
        this.message = new Message(container)
        
        window.addEventListener('keydown', (e) => this.handleKeyPress(e.key))
        
        this.updateBoard()
        this.preloadApiWord()
    }

    public handleKeyPress(key: string): void {
        if (this.state.gameStatus !== 'playing') return
        const normalizedKey = key.toUpperCase()

        if (/^[A-Z]$/.test(normalizedKey)) {
            this.addLetter(normalizedKey)
            return
        }
        if (key === 'Enter' || key === 'ENTER') {
            this.submitGuess()
            return
        }
        if (key === 'Backspace' || key === 'BACKSPACE') {
            this.removeLetter()
            return
        }
    }

    public removeLetter(): void {
        if (this.state.currentGuess.length === 0) return
        this.state.currentGuess = this.state.currentGuess.slice(0, -1)
        this.updateBoard()
    }

    public reset(): void {
        console.log('🔄 Reset called, nextApiWord:', this.nextApiWord)
        const newWord = this.nextApiWord || this.getInstantWord()
        console.log('🎯 Using word:', newWord, 'from:', this.nextApiWord ? 'API' : 'fallback')
        this.state = {
            currentGuess: '',
            guesses: [],
            gameStatus: 'playing',
            currentRow: 0,
            targetWord: newWord
        }
        
        if (this.nextApiWord) {
            this.nextApiWord = undefined
            this.preloadApiWord()
        }

        this.message.reset()
        this.board.reset()
        this.keyboard.reset()
        this.updateBoard() 
    }

    public async submitGuess(): Promise<void> {
        if (this.state.currentGuess.length !== WORD_LENGTH) {
            this.message.error('Not enough letters')
            this.board.shakeRow(this.state.currentRow)
            return
        }
        
        if (!(await this.isValidWord(this.state.currentGuess))) {
            this.message.error('Not in word list')
            this.board.shakeRow(this.state.currentRow)
            return
        }

        const evaluation = this.evaluateGuess(this.state.currentGuess)
        const guessTiles: TileData[] = this.state.currentGuess.split('').map((letter, idx) => ({
            letter,
            status: evaluation[idx]
        }))
        
        this.state.guesses.push(guessTiles)
        for (let col = 0; col < guessTiles.length; col++) {
            this.board.updateTile(this.state.currentRow, col, guessTiles[col].letter, guessTiles[col].status)
        }
        this.updateKeyboard()
        if (this.checkWinCondition()) {
            this.state.gameStatus = 'won'  
            this.message.success('Congratulations! You won!')
            setTimeout(() => this.reset(), 2500)
            return
        } else if (this.checkLoseCondition()) {
            this.state.gameStatus = 'lost'
            this.message.error(`Game Over! The word was ${this.state.targetWord}`)
            setTimeout(() => this.reset(), 3500)
            return
        } 
        this.state.currentRow++
        this.state.currentGuess = ''
    }

    // ===== PUBLIC METHODS =====
    public addLetter(letter: string): void {
        if (this.state.currentGuess.length >= WORD_LENGTH) return
        if (this.state.gameStatus !== 'playing') return
        if (!/^[A-Z]$/i.test(letter)) return 
        
        this.state.currentGuess += letter.toUpperCase()
        this.board.renderCurrentGuess(this.state.currentGuess, this.state.currentRow)
    }

    // ===== PRIVATE METHODS =====
    private getInstantWord(): string {
        //  Wordle words for instant start
        const excellentStarters = [
            'SLATE', 'CRANE', 'ARISE', 'RAISE', 'ROATE', 
            'DONUT', 'OILED', 'AUDIO', 'HOUSE', 'PLANT'
        ]
        return excellentStarters[Math.floor(Math.random() * excellentStarters.length)]
    }

    private async preloadApiWord(): Promise<void> {
        console.log('🔄 Starting preloadApiWord...')
        try {
            const word = await generateWordleWord()
            console.log('✅ Preload got word:', word, typeof word)
            this.nextApiWord = word
            console.log('💾 Stored nextApiWord:', this.nextApiWord)
        } catch (error) {
            console.log('❌ Preload failed:', error)
        }
    }

    private updateBoard(): void {
        this.board.render(
            this.state.guesses, 
            this.state.currentGuess, 
            this.state.currentRow
        )
    }

    private updateKeyboard(): void {
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
        const targetArray = this.state.targetWord.split('')
        const guessArray = guess.split('')
        const result: TileStatus[] = new Array(WORD_LENGTH).fill('absent')
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guessArray[i] === targetArray[i]) {
                result[i] = 'correct'
                targetArray[i] = '*' // Mark as used
                guessArray[i] = '*' // Mark as processed
            }
        }
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guessArray[i] !== '*') {
                const targetIndex = targetArray.indexOf(guessArray[i])
                if (targetIndex !== -1) {
                    result[i] = 'present'
                    targetArray[targetIndex] = '*' // Mark as used
                }
            }
        }
        return result
    }

    private async isValidWord(word: string): Promise<boolean> {
        try {
            const response = await fetch('/api/validate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ word }),
            })
            const data = await response.json()
            return data.isValid
          } catch (error) {
            console.error('❌ Error validating word:', error)
            // Fallback to basic validation if API fails
            this.message.error('Word validation service unavailable. Please try again.')
            return false
          }
    }

    private checkWinCondition(): boolean {
        const lastGuess = this.state.guesses[this.state.guesses.length - 1]
        if (!lastGuess) return false

        const guessWord = lastGuess.map(tile => tile.letter).join('')
        return guessWord === this.state.targetWord.toUpperCase()
    }

    private checkLoseCondition(): boolean {
        return this.state.currentRow >= MAX_GUESSES - 1
    }

}