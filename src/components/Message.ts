export type MessageType = 'success' | 'error' | 'info' | 'warning'

export interface MessageData {
    text: string
    type: MessageType
    duration?: number
    persistent?: boolean // if true, message won't auto-dismiss
}

// ===== MESSAGE CLASS =====
export class Message {
    private container: HTMLElement
    private currentMessage: HTMLElement | null = null

    constructor(parentElement: HTMLElement) {
        this.container = this.createContainer()
        parentElement.appendChild(this.container)
    }

    // ===== PRIVATE SETUP METHODS =====
    private createContainer(): HTMLElement {
        const container = document.createElement('div')
        container.className = 'message-container'
        return container
    }

    private createMessageElement(config: MessageData): HTMLElement {
        const messageEl = document.createElement('div')
        messageEl.className = `message message--${config.type}`
        messageEl.textContent = config.text
        return messageEl
    }

    // ===== PRIVATE UTILITY METHODS =====
    private hide(): void {
        if (!this.currentMessage) return

        this.currentMessage.style.animation = 'slide-out 0.3s ease-in'
        
        setTimeout(() => {
            if (this.currentMessage) {
                this.container.removeChild(this.currentMessage)
                this.currentMessage = null
            }
        }, 300)
    }

    // ===== PUBLIC METHODS =====
    public show(config: MessageData): void {
        // If a message is already displayed, hide it first
        this.hide()
        this.currentMessage = this.createMessageElement(config)
        this.container.appendChild(this.currentMessage)
        if (config.duration && !config.persistent) {
            setTimeout(() => {
                this.hide()
            }, config.duration)
        }
    }

    public reset(): void {
        this.hide()
    }

    // ===== HELPER METHODS =====
    public success(text: string, duration = 2000): void {
        this.show({ text, type: 'success', duration })
    }

    public error(text: string, duration = 3000): void {
        this.show({ text, type: 'error', duration })
    }

    public info(text: string, duration = 2000): void {
        this.show({ text, type: 'info', duration })
    }

    public warning(text: string, duration = 2000): void {
        this.show({ text, type: 'warning', duration })
    }
}