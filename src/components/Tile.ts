// ===== TYPE DEFINITIONS =====
export type TileStatus = 'correct' | 'present' | 'absent' | 'empty'

export interface TileData {
  letter: string
  status: TileStatus
}

// ===== CONSTANTS =====
export const TILE_STATUSES = {
  CORRECT: 'correct' as const,
  PRESENT: 'present' as const,
  ABSENT: 'absent' as const,
  EMPTY: 'empty' as const,
} as const

// ===== TILE CLASS =====
export class Tile {
    private data: TileData

    constructor(letter: string = '', status: TileStatus = 'empty') {
        this.data = { letter, status }
    }

    // ===== STATIC FACTORY METHODS =====
    static createEmpty(): TileData {
        return { letter: '', status: 'empty' }
    }

    static createWithLetter(letter: string): TileData {
    return { letter, status: 'empty' }
    }

    static updateStatus(tile: TileData, status: TileStatus): TileData {
        return { ...tile, status }
    }

    static isEmpty(tile: TileData): boolean {
        return tile.letter === '' || tile.status === 'empty'
    }

    // ===== INSTANCE GETTERS =====
    get letter(): string { return this.data.letter }
    get status(): TileStatus { return this.data.status }
    get tileData(): TileData { return { ...this.data } }

    // ===== INSTANCE SETTERS =====
    setLetter(letter: string): void {
        this.data.letter = letter
    }

    setStatus(status: TileStatus): void {
        this.data.status = status
    }

    // ===== INSTANCE METHODS =====
    isEmpty(): boolean {
        return Tile.isEmpty(this.data)
    }

    isCorrect(): boolean {
        return this.data.status === 'correct'
    }

    // Future instance methods:
    // validate(): boolean
    // animate(): void  
    // clone(): Tile
}