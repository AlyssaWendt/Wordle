import { Game } from './components/Game'
//import './styles/main.scss'

// ===== APP INITIALIZATION =====
function initializeApp(): void {
  const appContainer = document.querySelector<HTMLDivElement>('#app')
  
  if (!appContainer) {
    throw new Error('App container not found')
  }

  // Set up the basic HTML structure
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

  // Get the game container
  const gameContainer = document.querySelector<HTMLDivElement>('#game-container')
  
  if (!gameContainer) {
    throw new Error('Game container not found')
  }

  // Initialize the game
  const game = new Game(gameContainer)
  
  // Optional: Add any global event listeners or setup
  console.log('Wordle game initialized!')
}

// ===== APP STARTUP =====
document.addEventListener('DOMContentLoaded', initializeApp)

// Export for potential future use
export { initializeApp }
