import type { TileStatus } from './Tile'

// ===== CONSTANTS =====
const KEYBOARD_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
]

// ===== KEYBOARD CLASS =====
export class Keyboard {
    private container: HTMLElement
    private keyboardElement: HTMLElement
    private keyElements: Map<string, HTMLElement>
    private keyStatusMap: Map<string, TileStatus>
    private onKeyPress: (key: string) => void

    constructor(container: HTMLElement, onKeyPress: (key: string) => void) {
        this.container = container
        this.onKeyPress = onKeyPress
        this.keyElements = new Map()
        this.keyStatusMap = new Map()
        
        this.keyboardElement = this.createKeyboardElement()
        this.createKeyElements()
        this.container.appendChild(this.keyboardElement)
        
        this.initializeKeyStatuses()
    }

    // ===== STATIC HELPER METHODS =====
    static isValidLetter(key: string): boolean {
        return /^[A-Z]$/.test(key.toUpperCase())
    }

    static isSpecialKey(key: string): boolean {
        return key === 'ENTER' || key === 'BACKSPACE'
    }

    // ===== PRIVATE SETUP METHODS =====
    private createKeyboardElement(): HTMLElement {
        const keyboard = document.createElement('div')
        keyboard.className = 'keyboard'
        return keyboard
    }

    private createKeyElements(): void {
        KEYBOARD_LAYOUT.forEach(row => {
            const rowDiv = document.createElement('div')
            rowDiv.className = 'keyboard-row'
            
            row.forEach(key => {
                const keyButton = document.createElement('button')
                keyButton.className = this.getKeyClassName(key)
                keyButton.textContent = this.getKeyDisplayText(key)
                keyButton.dataset.key = key
                
                keyButton.addEventListener('click', () => this.handleKeyClick(key))
                
                this.keyElements.set(key, keyButton)
                rowDiv.appendChild(keyButton)
            })
            
            this.keyboardElement.appendChild(rowDiv)
        })
    }

    private getKeyClassName(key: string): string {
        const baseClass = 'keyboard-key'
        
        if (key === 'ENTER' || key === 'BACKSPACE') {
            return `${baseClass} ${baseClass}--special`
        }
        
        return baseClass
    }

    private getKeyDisplayText(key: string): string {
        switch (key) {
            case 'BACKSPACE':
                return '⌫'
            case 'ENTER':
                return 'ENTER'
            default:
                return key
        }
    }

    private initializeKeyStatuses(): void {
        KEYBOARD_LAYOUT.flat().forEach(key => {
            if (Keyboard.isValidLetter(key)) {
                this.keyStatusMap.set(key, 'empty')
            }
        })
    }

    private handleKeyClick(key: string): void {
        this.onKeyPress(key)
    }

    // ===== PUBLIC METHODS =====
    public updateKeyStatus(letter: string, status: TileStatus): void {
        const normalizedLetter = letter.toUpperCase()
        const keyElement = this.keyElements.get(normalizedLetter)
        
        if (!keyElement || !Keyboard.isValidLetter(normalizedLetter)) return
        
        // Only update if new status is "better" (correct > present > absent > empty)
        const currentStatus = this.keyStatusMap.get(normalizedLetter) || 'empty'
        const newStatus = this.getBetterStatus(currentStatus, status)
        
        this.keyStatusMap.set(normalizedLetter, newStatus)
        this.updateKeyElementStatus(keyElement, newStatus)
    }

    public updateMultipleKeys(letters: { letter: string, status: TileStatus }[]): void {
        letters.forEach(({ letter, status }) => {
            this.updateKeyStatus(letter, status)
        })
    }

    public reset(): void {
        this.keyStatusMap.forEach((_, key) => {
            if (Keyboard.isValidLetter(key)) {
                this.keyStatusMap.set(key, 'empty')
                const keyElement = this.keyElements.get(key)
                if (keyElement) {
                    this.updateKeyElementStatus(keyElement, 'empty')
                }
            }
        })
    }

    public getKeyStatus(letter: string): TileStatus {
        return this.keyStatusMap.get(letter.toUpperCase()) || 'empty'
    }

    // ===== PRIVATE HELPER METHODS =====
    private getBetterStatus(current: TileStatus, newStatus: TileStatus): TileStatus {
        const statusPriority = { 'correct': 3, 'present': 2, 'absent': 1, 'empty': 0 }
        
        const currentPriority = statusPriority[current] || 0
        const newPriority = statusPriority[newStatus] || 0
        
        return newPriority > currentPriority ? newStatus : current
    }

    private updateKeyElementStatus(keyElement: HTMLElement, status: TileStatus): void {
        keyElement.classList.remove('correct', 'present', 'absent', 'empty')
        
        if (status !== 'empty') {
            keyElement.classList.add(status)
        }
    }

    // Future methods:
    // public disableKey(key: string): void
    // public enableKey(key: string): void  
    // public animateKeyPress(key: string): void
}