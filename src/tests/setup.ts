import { vi, beforeEach } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock DOM methods
Object.defineProperty(window, 'document', {
  value: {
    createElement: vi.fn(() => ({
      innerHTML: '',
      textContent: '',
      className: '',
      classList: { add: vi.fn(), remove: vi.fn(), contains: vi.fn() },
      appendChild: vi.fn(),
      addEventListener: vi.fn(),
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      style: {},
    })),
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
  },
  writable: true,
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})