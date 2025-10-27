import { Game } from './components/Game'
import './styles/main.scss'

// ===== APP INITIALIZATION =====
function init(): void {
  const appContainer = document.querySelector<HTMLDivElement>('#app')
  
  if (!appContainer) {
    throw new Error('App container not found')
  }

  appContainer.innerHTML = `
    <div class="wordle-app">
      <header class="header">
        <h1 class="title">Wordle</h1>
      </header>
      <main class="main">
        <div id="game-container" class="game-container">
          <!-- Game components will be inserted here -->
        </div>
      </main>
    </div>
  `

  const gameContainer = document.querySelector<HTMLDivElement>('#game-container')
  
  if (!gameContainer) {
    throw new Error('Game container not found')
  }

  const game = new Game(gameContainer)
  
  console.log('Wordle game initialized!', { game })
}

// ===== APP STARTUP =====
document.addEventListener('DOMContentLoaded', init)

export { init }
