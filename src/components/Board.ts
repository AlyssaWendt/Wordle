import { Tile } from './Tile'
import type { TileData, TileStatus } from './Tile'

// ===== CONSTANTS =====
const BOARD_ROWS = 6
const BOARD_COLS = 5

// ===== BOARD CLASS =====
export class Board {
    private container: HTMLElement
    private boardElement: HTMLElement
    private tileElements: HTMLElement[][]
    
    constructor(container: HTMLElement) {
        this.container = container
        this.boardElement = this.createBoardElement()
        this.tileElements = this.createTileElements()
        this.container.appendChild(this.boardElement)
    }

    // ===== STATIC HELPER METHODS =====
    static createEmptyGrid(): TileData[][] {
        return Array(BOARD_ROWS).fill(null).map(() => 
            Array(BOARD_COLS).fill(null).map(() => Tile.createEmpty())
        )
    }

    // ===== PRIVATE SETUP METHODS =====
    private createBoardElement(): HTMLElement {
        const board = document.createElement('div')
        board.className = 'board'
        return board
    }

    private createTileElements(): HTMLElement[][] {
        const tiles: HTMLElement[][] = []
        
        for (let row = 0; row < BOARD_ROWS; row++) {
            const rowDiv = document.createElement('div')
            rowDiv.className = 'board-row'
            
            const rowTiles: HTMLElement[] = []
            for (let col = 0; col < BOARD_COLS; col++) {
                const tileDiv = document.createElement('div')
                tileDiv.className = 'board-tile'
                tileDiv.dataset.row = row.toString()
                tileDiv.dataset.col = col.toString()
                
                rowDiv.appendChild(tileDiv)
                rowTiles.push(tileDiv)
            }
            
            this.boardElement.appendChild(rowDiv)
            tiles.push(rowTiles)
        }
        
        return tiles
    }

    // ===== PUBLIC METHODS =====
    public render(guesses: TileData[][], currentGuess: string = '', currentRow: number = 0): void {
        // Clear all tiles first
        this.reset()
        
        // Render completed guesses
        for (let row = 0; row < guesses.length; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                const tile = guesses[row]?.[col]
                if (tile) {
                    this.updateTile(row, col, tile.letter, tile.status)
                }
            }
        }

        // Render current guess row
        if (currentRow < BOARD_ROWS) {
            // Clear the current row first
            for (let col = 0; col < BOARD_COLS; col++) {
                this.updateTile(currentRow, col, '', 'empty')
            }
            
            // Then fill in the letters from currentGuess
            for (let col = 0; col < currentGuess.length && col < BOARD_COLS; col++) {
                const letter = currentGuess[col]
                this.updateTile(currentRow, col, letter, 'empty')
            }
        }
    }

    // Add a more efficient method for just updating the current guess
    public renderCurrentGuess(currentGuess: string, currentRow: number): void {
        if (currentRow >= BOARD_ROWS) return
        
        // Clear the current row
        for (let col = 0; col < BOARD_COLS; col++) {
            this.updateTile(currentRow, col, '', 'empty')
        }
        
        // Fill in the current guess letters
        for (let col = 0; col < currentGuess.length && col < BOARD_COLS; col++) {
            const letter = currentGuess[col]
            this.updateTile(currentRow, col, letter, 'empty')
        }
    }

    public updateTile(row: number, col: number, letter: string, status: TileStatus): void {
        const tileElement = this.tileElements[row]?.[col]
        if (!tileElement) return

        tileElement.textContent = letter
        tileElement.className = `board-tile ${status}`
    }

    public reset(): void {
        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let col = 0; col < BOARD_COLS; col++) {
                this.updateTile(row, col, '', 'empty')
            }
        }
    }

    // Future methods:
    // public animateRow(row: number): void
    // public shakeRow(row: number): void
    // public highlightTile(row: number, col: number): void
}