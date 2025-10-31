# 🎯 Wordle Game Clone

A pixel-perfect recreation of the popular Wordle game built with modern web technologies. Features authentic animations, responsive design, and intelligent word generation.


## 🌟 Live Demo

**[Play the Game →](https://wordle-xi-six.vercel.app/)**

**[View Repository →](https://github.com/AlyssaWendt/Wordle)**

---

## 🚀 Key Features

### 🎮 **Authentic Gameplay**
- **6 attempts** to guess a 5-letter word
- **Color-coded feedback**: Green (correct), Yellow (present), Gray (absent)
- **Smart duplicate letter handling** following official Wordle rules
- **Win/loss detection** with automatic game reset

### ✨ **Polished Animations**
- **Tile flip animation** with staggered timing for that satisfying ripple effect
- **Shake animation** for invalid word submissions
- **Pop animation** when typing letters
- **Smooth transitions** throughout the interface

### 📱 **Responsive Design**
- **Mobile-optimized** touch targets and layouts
- **Keyboard support** for desktop users
- **Accessible design** with proper focus states
- **Cross-browser compatibility**

### 🔧 **Technical Highlights**
- **Custom message system** replacing browser alerts
- **AI-powered word generation** using OpenAI API with fallback system
- **Real-time word validation** with error handling
- **Component-based architecture** for maintainable code

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type-safe development and better code maintainability |
| **Sass/SCSS** | Advanced styling with variables, nesting, and mixins |
| **Vite** | Fast development server and optimized builds |
| **OpenAI API** | Dynamic word generation for endless gameplay |
| **Vanilla DOM** | Lightweight, framework-free implementation |

---

## 🏗️ Architecture & Code Quality

### **Clean Component Structure**
```
src/
├── components/
│   ├── Game.ts          # Core game logic and state management
│   ├── Board.ts         # Grid display and tile management
│   ├── Keyboard.ts      # Interactive keyboard component
│   ├── Message.ts       # Custom notification system
│   └── Tile.ts          # Individual tile component
├── styles/
│   ├── main.scss        # Main stylesheet with animations
│   └── _variables.scss  # Design system tokens
└── utils/
    └── wordGenerator.ts # API integration with fallbacks
```

### **Key Engineering Decisions**

- **🎯 State Management**: Centralized game state with clear data flow
- **🔄 Error Handling**: Graceful fallbacks for API failures
- **🎨 CSS Architecture**: Modular Sass with BEM-like naming
- **📐 TypeScript**: Strict typing for better developer experience
- **🧪 Testable Code**: Clear separation of concerns for easy testing

---

## 💡 Problem-Solving Highlights

### **Challenge: Authentic Wordle Letter Evaluation**
**Solution**: Implemented complex duplicate letter logic that matches the official game:
```typescript
// Handles cases like guessing "SPEED" when answer is "ERASE"
// Correctly shows: S(gray) P(gray) E(yellow) E(gray) D(gray)
private evaluateGuess(guess: string): TileStatus[] {
    // Two-pass algorithm ensuring correct duplicate handling
}
```

### **Challenge: Smooth Animation Timing**
**Solution**: Staggered CSS animations with precise timing:
```scss
// Creates the satisfying left-to-right ripple effect
&[data-col="0"] { animation-delay: 0ms; }
&[data-col="1"] { animation-delay: 150ms; }
&[data-col="2"] { animation-delay: 300ms; }
// ...
```

### **Challenge: Mobile Touch Optimization**
**Solution**: Responsive design with proper touch targets:
```scss
@media (max-width: 480px) {
    .keyboard-key {
        min-height: 48px; // Meets accessibility guidelines
        font-size: 16px;   // Prevents iOS zoom
    }
}
```

---

## 🎯 What This Demonstrates

### **Frontend Skills**
- ✅ **Complex State Management** without frameworks
- ✅ **Advanced CSS Animations** and responsive design
- ✅ **TypeScript Proficiency** with strict typing
- ✅ **API Integration** with error handling
- ✅ **User Experience Focus** with polished interactions

### **Engineering Practices**
- ✅ **Component Architecture** for maintainable code
- ✅ **Error Handling & Fallbacks** for robust applications
- ✅ **Performance Optimization** with efficient DOM updates
- ✅ **Clean Code Principles** with clear naming and structure

### **Attention to Detail**
- ✅ **Pixel-perfect recreation** of the original game
- ✅ **Smooth animations** that feel natural
- ✅ **Edge case handling** (invalid words, API failures)
- ✅ **Mobile optimization** for all devices

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/AlyssaWendt/Wordle.git

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 🎯 For Recruiters

This project showcases:

- **📐 Problem-solving skills** through complex game logic implementation
- **🎨 Frontend expertise** with advanced CSS and animations  
- **⚡ Modern tooling** knowledge (TypeScript, Vite, Sass)
- **🔧 API integration** skills with proper error handling
- **📱 Responsive design** capabilities for all devices
- **🎯 Attention to detail** in recreating a pixel-perfect experience

**Perfect for roles involving**: Frontend Development, TypeScript, Game Development, UI/UX Implementation, API Integration

---

*Built with ❤️ by [Alyssa Wendt](https://github.com/AlyssaWendt)*