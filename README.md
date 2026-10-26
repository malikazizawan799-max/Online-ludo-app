# Ludo King Pro — Professional Online Multiplayer Game

A production-grade, responsive online multiplayer and offline pass-and-play Ludo game built with React, TypeScript, Tailwind CSS, HTML5/SVG vector graphics, and Firebase (Cloud Firestore & Authentication).

---

## 🌟 Key Features

### 1. Authentic Standard Ludo Rules Engine
- **4 Players & Colors**: Red, Green, Yellow, and Blue with 4 tokens each.
- **Yard to Track Activation**: Requires rolling a `6` to bring a token from Yard (`-1`) onto the player's starting square (`0`).
- **Standard 52-Square Circuit**: Clockwise movement with color-specific track offsets (Red: 0, Green: 13, Yellow: 26, Blue: 39).
- **8 Star Safe Squares**: Global positions 0, 8, 13, 21, 26, 34, 39, and 47 are immune to token captures.
- **Opponent Captures**: Landing on an unprotected enemy token knocks it back to Yard (`-1`) and awards an **extra turn**.
- **Consecutive Sixes Rule**: Rolling three 6s in a row forfeits the 3rd roll and passes the turn to prevent infinite rolling.
- **Exact Home Finish**: Tokens enter the private colored home lane (5 squares) and require an exact roll to land on the center Home (step 56).
- **Extra Turns**: Awarded upon rolling a 6, capturing an opponent, or entering Home.
- **Auto-Pass on No Legal Moves**: If no tokens can move on a roll, the turn smoothly passes to the next player.

### 2. Online Real-Time Multiplayer
- **Private Rooms**: Create a room with a unique 6-character room code (e.g. `LUDO78`).
- **Join with Code**: Friends can join immediately from any phone or computer browser.
- **Lobby System**: Host and players see connected slots, assigned colors, ready indicators, and a host "Start Match" button.
- **Cloud Firestore Synchronization**: Dice rolls, token steps, captures, and turn transitions sync in real-time via `onSnapshot` listeners.
- **Interactive Emoji Reactions**: Floating celebratory and expressive emojis (`🎉`, `🎲`, `🔥`, `👑`, `😱`, `😂`, `👏`) sent across players in real-time.
- **Turn Timers**: 30-second countdown with visual progress bar to ensure matches never stall.

### 3. Complete Offline Mode (Zero Network Dependency)
- **Local Pass-and-Play**: 2, 3, or 4 players on a single device.
- **Computer Bot AI**: Intelligent heuristic decision making that prioritizes captures, yard exits on 6, home finishes, safe square landings, and threat evasion.
- **100% Offline**: Works without network connection once loaded.

### 4. Audio & Visuals
- **Zero-Dependency Web Audio API**: Procedural sound generation for dice rolls, token hops, yard spawns, captures, home finishes, and victory fanfare (guaranteed to never 404).
- **Background Ambient Music**: Soothing synthesized musical progression chords with instant mute toggle.
- **Haptic Vibration**: Mobile phone vibration feedback on roll, moves, and captures where supported.
- **3D Animated Dice**: Realistic physics rotation, tactile roll button, and face pip rendering (1 to 6).
- **High-DPI Vector Board**: 15x15 SVG board with dynamic token clustering (tokens on the same cell neatly offset so all are visible and clickable).

### 5. Player Accounts & Profiles
- **Guest Play**: Instant anonymous login with persistent local profile.
- **Google Sign-In**: Optional Google Account linking via Firebase Authentication.
- **Custom Avatars & Names**: 8 character avatars with win/match career statistics.

---

## 📱 Mobile & Android Testing Instructions

1. **Responsive Viewport**: The application is designed mobile-first with touch-friendly controls (`user-scalable=no` meta viewport).
2. **Chrome DevTools Mobile Simulation**:
   - Open DevTools (`F12` or `Ctrl+Shift+I`).
   - Click the **Device Toolbar** button (`Ctrl+Shift+M`).
   - Select **Pixel 7**, **Samsung Galaxy S20**, or **iPhone 14 Pro**.
3. **Multi-Client Multiplayer Testing**:
   - Open the app in your primary browser tab and click **Create Room**.
   - Note the 6-character room code.
   - Open a second Incognito tab or separate browser window.
   - Click **Join Room** and enter the code.
   - The host lobby updates live; click **Start Match** to experience synchronized two-device gameplay!

---

## 🧪 Automated Game Engine Test Suite

The game includes built-in unit tests verifying core Ludo rules:
- Yard exit validation (`roll === 6`)
- Exact home count and overshooting prevention
- Legal move calculation
- Token move execution and board spawning
- Opponent capture and yard reset
- Safe star square protection
- Bot AI capture priority
- Turn progression and clockwise alternation

You can run these tests in real-time from the in-game **Settings > Game Engine Test Suite > Run Tests**.

---

## 🚀 Build and Deployment

```bash
# Install dependencies
npm install

# Run development server (runs on port 3000)
npm run dev

# Run TypeScript linter
npm run lint

# Build for production
npm run build
```
