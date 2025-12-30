# Cube App Documentation

A modern Rubik's Cube timer and solver application built with React, Three.js, and TypeScript. This app connects to GAN Smart Cubes via Bluetooth, tracks solves, analyzes CFOP method phases, and provides comprehensive statistics and solve replays.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Architecture Overview](#architecture-overview)
4. [Core Features](#core-features)
5. [Theming System](#theming-system)
6. [Component Library](#component-library)
7. [Custom Hooks](#custom-hooks)
8. [Cube Logic & Algorithms](#cube-logic--algorithms)
9. [3D Rendering](#3d-rendering)
10. [Smart Cube Integration](#smart-cube-integration)
11. [State Management](#state-management)
12. [Data Flow](#data-flow)

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 |
| **Language** | TypeScript 5.9 |
| **Build Tool** | Vite 7 |
| **3D Graphics** | Three.js, React Three Fiber, React Three Drei |
| **Styling** | Tailwind CSS 3.4 |
| **Animation** | Framer Motion |
| **UI Components** | shadcn/ui (Radix primitives) |
| **Cube Library** | `cubing` (kpuzzle, scramble generation) |
| **Smart Cube** | `gan-web-bluetooth` |
| **Icons** | Lucide React |
| **Routing** | React Router DOM 7 |

---

## Project Structure

```
src/
├── App.tsx                    # Main application component & state orchestration
├── main.tsx                   # App entry point with ThemeProvider
├── index.css                  # Global styles & CSS variables
│
├── types/
│   └── index.ts               # Centralized TypeScript type definitions
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Navigation header with user dropdown
│   │   ├── Footer.tsx         # Footer with version & links
│   │   └── StatusBar.tsx      # Stats display (ao5, pb, battery)
│   │
│   ├── cube/
│   │   ├── index.tsx          # CubeViewer canvas wrapper
│   │   └── RubiksCube.tsx     # 3D Rubik's Cube with animations
│   │
│   ├── ui/
│   │   ├── index.ts           # Barrel export for all UI components
│   │   ├── button.tsx         # shadcn Button component
│   │   ├── tooltip.tsx        # shadcn Tooltip component
│   │   ├── card.tsx           # Reusable Card component
│   │   ├── kbd.tsx            # Keyboard key display component
│   │   ├── icon-button.tsx    # Reusable animated icon button
│   │   └── stat-display.tsx   # Stat display components
│   │
│   ├── timer-display.tsx      # Timer UI with status
│   ├── scramble-notation.tsx  # Interactive scramble progress display
│   ├── scramble-display.tsx   # Alternative scramble display
│   ├── solve-results.tsx      # Post-solve results & CFOP breakdown
│   ├── solves-list.tsx        # Solve history table
│   ├── solve-detail-page.tsx  # Detailed solve view with tabs
│   ├── solve-replay-content.tsx # Solve replay with gyro playback
│   ├── solve-stats-content.tsx  # Detailed statistics visualization
│   ├── settings-panel.tsx     # Theme & animation settings
│   ├── simulator.tsx          # CFOP algorithm simulator
│   ├── command-palette.tsx    # Ctrl+K command search
│   ├── connection-modal.tsx   # Bluetooth connection dialog
│   ├── calibration-modal.tsx  # Cube sync & gyro calibration
│   ├── cube-net.tsx           # 2D cube net visualization
│   ├── cfop-analysis.tsx      # CFOP phase breakdown display
│   ├── keyboard-hints.tsx     # Keyboard shortcut hints
│   ├── gradient-orbs.tsx      # Background decorative elements
│   ├── static-cube.tsx        # Simple static 3D cube
│   ├── Sidebar.tsx            # Navigation sidebar (alternate layout)
│   ├── debug-config-panel.tsx # Scene configuration debug panel
│   └── theme-provider.tsx     # React context for theme
│
├── hooks/
│   ├── useGanCube.ts          # GAN Bluetooth cube connection
│   ├── useCubeState.ts        # Cube pattern state (cubing library)
│   ├── useCubeFaces.ts        # Face-based cube state
│   ├── useScrambleTracker.ts  # Scramble progress tracking
│   ├── useTimer.ts            # Timer logic (inspection/running/stopped)
│   ├── useSolves.ts           # Solve history with localStorage
│   ├── useSettings.ts         # App settings persistence
│   ├── useGyroRecorder.ts     # Gyroscope data recording
│   ├── useSceneConfig.tsx     # Scene configuration state
│   ├── useKeyboardShortcuts.ts # Declarative keyboard shortcuts hook
│   ├── useCalibrationSequence.ts # Calibration gesture detection
│   └── useSolveSession.ts     # Main session orchestration hook
│
├── lib/
│   ├── format.ts              # Centralized formatting utilities
│   ├── constants.ts           # Shared constants & magic values
│   ├── cube-state.ts          # Cube state using cubing library
│   ├── cube-faces.ts          # Face-based cube representation
│   ├── move-utils.ts          # Move parsing & manipulation
│   ├── cfop-analyzer.ts       # CFOP phase detection algorithm
│   ├── solve-stats.ts         # Solve statistics calculation
│   ├── themes.ts              # Theme definitions & application
│   └── utils.ts               # Tailwind class merge utility
│
└── config/
    └── scene-config.ts        # 3D scene configuration
```

---

## Architecture Overview

### Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    State Management                       │   │
│  │  • Timer state (useTimer)                                │   │
│  │  • Cube state (useCubeState, useCubeFaces)              │   │
│  │  • Scramble tracking (useScrambleTracker)               │   │
│  │  • Solve history (useSolves)                            │   │
│  │  • GAN connection (useGanCube)                          │   │
│  │  • Settings (useSettings)                               │   │
│  │  • Gyro recording (useGyroRecorder)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      UI Tabs                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │  Timer   │ │  Solves  │ │ Simulator│ │ Settings │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Patterns

1. **Hooks-Based Architecture**: All logic is encapsulated in custom hooks
2. **Ref-Based Updates**: Performance-critical data (quaternion, move callbacks) uses refs to avoid re-renders
3. **Dual Cube State**: Uses both `cubing` library patterns and custom face-based tracking
4. **Theme Variables**: CSS custom properties for consistent theming
5. **Component Composition**: Small, focused components composed together

---

## Core Features

### 1. Smart Cube Connection
- Connects to GAN Smart Cubes via Web Bluetooth API
- Real-time move detection and gyroscope orientation
- Battery level monitoring
- MAC address fallback for connection issues

### 2. Timer System
- **Idle**: Waiting for scramble
- **Inspection**: Post-scramble inspection phase
- **Running**: Active timer during solve
- **Stopped**: Solve complete

### 3. Scramble Tracking
- Generates random 3x3 scrambles using `cubing` library
- Tracks user's scramble execution progress
- Detects divergence and shows recovery moves
- Visual feedback for completed/current/pending moves

### 4. CFOP Analysis
- Automatically detects cross color
- Identifies Cross, F2L slots (4), OLL, and PLL phases
- Tracks move counts and timing per phase
- Compares actual splits to ideal splits

### 5. Solve Statistics
- Total time, TPS (turns per second), move count
- Per-phase breakdown with recognition/execution times
- TPS over time graph
- Historical averages (Ao5, Ao12)

### 6. Solve Replay
- Records gyroscope data during solves
- Playback with variable speed control
- 2D and 3D view modes
- Move-by-move stepping

---

## Theming System

### Theme Structure

Themes are defined in `src/lib/themes.ts`:

```typescript
interface Theme {
  name: string
  colors: {
    bg: string          // Main background
    bgSecondary: string // Secondary panels
    main: string        // Primary accent
    sub: string         // Subdued text
    subAlt: string      // Borders, dividers
    text: string        // Primary text
    error: string       // Error states
    accent: string      // Interactive elements
    accentHover: string // Hover states
  }
}
```

### Available Themes

| Theme | Style |
|-------|-------|
| `dark` | Default dark theme |
| `light` | Light mode |
| `serikaDark` | Monkeytype-inspired dark |
| `serikaLight` | Monkeytype-inspired light |
| `nord` | Nord color palette |
| `dracula` | Dracula theme |
| `monokai` | Monokai editor theme |
| `ocean` | Blue ocean tones |
| `matrix` | Green terminal style |
| `midnight` | Purple dark theme |
| `everforest` | Soft green nature theme |
| `oneDark` | Atom One Dark |

### CSS Variables

Themes are applied via CSS custom properties:

```css
:root {
  --theme-bg: #0a0a0a;
  --theme-bgSecondary: #171717;
  --theme-main: #e2b714;
  --theme-sub: #646669;
  --theme-subAlt: #2c2e31;
  --theme-text: #d1d0c5;
  --theme-error: #ca4754;
  --theme-accent: #e2b714;
  --theme-accentHover: #c9a312;
  --radius: 0.75rem;
}
```

### Usage Pattern

Components use inline styles with CSS variables:

```tsx
<div 
  className="rounded-lg p-4"
  style={{ 
    backgroundColor: 'var(--theme-bgSecondary)',
    color: 'var(--theme-text)',
    border: '1px solid var(--theme-subAlt)'
  }}
>
```

---

## Component Library

### shadcn/ui Setup

Configuration in `components.json`:

```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Button Component

Uses Class Variance Authority (CVA) for variants:

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2...',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90',
        secondary: '...',
        outline: '...',
        ghost: '...',
        link: '...',
        destructive: '...',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
  }
)
```

### Tooltip Component

Built on Radix UI primitives:

```tsx
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Content here</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Custom Hooks

### useGanCube

Manages GAN Smart Cube Bluetooth connection:

```typescript
interface GanCubeState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  deviceName: string | null
  isMacAddressRequired: boolean
  debugLog: string[]
  batteryLevel: number | null
}

// Returns
{
  ...state,
  connect,          // Initiate connection
  disconnect,       // Disconnect cube
  resetGyro,        // Reset gyroscope orientation
  clearError,       // Clear error state
  submitMacAddress, // Submit MAC for manual connection
  quaternionRef,    // Current orientation (ref)
}
```

### useCubeState

Manages cube pattern using `cubing` library:

```typescript
{
  cubeState,        // Current KPattern
  isLoading,        // Initial load state
  currentScramble,  // Current scramble string
  isSolved,         // Whether cube is solved
  performMove,      // Apply single move
  performAlgorithm, // Apply algorithm string
  reset,            // Reset to solved
  scramble,         // Generate and apply scramble
}
```

### useCubeFaces

Face-based cube representation:

```typescript
type Color = 'W' | 'Y' | 'G' | 'B' | 'R' | 'O'

interface CubeFaces {
  U: Color[]  // 9 colors for Up face
  D: Color[]  // Down
  F: Color[]  // Front
  B: Color[]  // Back
  L: Color[]  // Left
  R: Color[]  // Right
}

{
  faces,            // Current state
  performMove,      // Apply move
  applyScramble,    // Apply scramble algorithm
  reset,            // Reset to solved
  isSolved,         // Check if solved
  getHistory,       // Get move/state history
  clearHistory,     // Clear history
}
```

### useScrambleTracker

Tracks scramble execution progress:

```typescript
type ScrambleStatus = 'idle' | 'scrambling' | 'diverged' | 'completed' | 'solving' | 'solved'

{
  status,           // Current scramble status
  originalScramble, // Full scramble string
  moves,            // Move states with status
  currentIndex,     // Current move index
  recoveryMoves,    // Moves to undo divergence
  divergedMoves,    // Wrong moves made
  isSolved,         // Cube solved state
  solutionMoves,    // Solution move list
}
```

### useTimer

Timer with inspection phase:

```typescript
type TimerStatus = 'idle' | 'inspection' | 'running' | 'stopped'

{
  status,
  time,             // Current time in ms
  startInspection,  // Start inspection phase
  startTimer,       // Start running timer
  stopTimer,        // Stop and return final time
  reset,            // Reset to idle
}
```

### useSolves

Solve history with localStorage persistence:

```typescript
interface Solve {
  id: string
  time: number
  scramble: string
  solution: string[]
  date: string
  dnf?: boolean
  plusTwo?: boolean
  cfopAnalysis?: CFOPAnalysis
  gyroData?: GyroFrame[]
  moveTimings?: MoveFrame[]
}

{
  solves,           // Solve array
  addSolve,         // Add new solve
  deleteSolve,      // Remove solve
  updateSolve,      // Update solve data
  clearAll,         // Clear all solves
  getStats,         // Calculate statistics
}
```

### useSettings

Application settings:

```typescript
interface AppSettings {
  animationSpeed: number  // Turn animation speed (5-50)
  gyroEnabled: boolean    // Record gyro data
  theme: string           // Theme key
}

{
  settings,
  updateSetting,    // Update single setting
  resetSettings,    // Reset to defaults
}
```

---

## Cube Logic & Algorithms

### Move Representation

```typescript
type MoveBase = 'U' | 'D' | 'L' | 'R' | 'F' | 'B'
type MoveModifier = '' | "'" | '2'
type Move = `${MoveBase}${MoveModifier}`

interface ParsedMove {
  face: MoveBase
  modifier: MoveModifier
  original: string
}
```

### Move Utilities

```typescript
parseMove("R'")      // { face: 'R', modifier: "'", original: "R'" }
parseScramble("R U R' U'")  // ParsedMove[]
getInverseMove(move) // Returns inverse move
combineMove(a, b)    // Combine same-face moves
isSameFace(a, b)     // Check if same face
```

### Face-Based State

The cube is represented as 6 faces, each with 9 colors:

```
      ┌─────┐
      │  U  │
┌─────┼─────┼─────┬─────┐
│  L  │  F  │  R  │  B  │
└─────┼─────┼─────┴─────┘
      │  D  │
      └─────┘

Index layout per face:
┌───┬───┬───┐
│ 0 │ 1 │ 2 │
├───┼───┼───┤
│ 3 │ 4 │ 5 │  (4 = center)
├───┼───┼───┤
│ 6 │ 7 │ 8 │
└───┴───┴───┘
```

### CFOP Analysis Algorithm

Located in `src/lib/cfop-analyzer.ts`:

1. **Cross Detection**: Checks if 4 edge pieces form a cross with correct center alignment
2. **F2L Slots**: Checks corner-edge pairs in each slot
3. **OLL Detection**: All top face pieces match top color
4. **PLL Detection**: All faces solved (cube complete)

```typescript
function analyzeCFOP(moves: string[], stateHistory: CubeFaces[]): CFOPAnalysis {
  // Iterate through state history
  // Detect when each phase completes
  // Return phase boundaries and moves
}
```

---

## 3D Rendering

### React Three Fiber Setup

```tsx
<Canvas camera={{ position: [6, 4.5, 6], fov: 31 }}>
  <ambientLight intensity={0} />
  <directionalLight position={[10, 10, 5]} intensity={0.8} />
  <group scale={0.5}>
    <RubiksCube 
      pattern={pattern}
      quaternionRef={quaternionRef}
      cubeRef={cubeRef}
      animationSpeed={15}
    />
  </group>
  <OrbitControls enablePan={false} minDistance={5.5} maxDistance={12} />
  <Environment preset="sunset" />
</Canvas>
```

### Cubie Rendering

Each cubie (small cube) is rendered with:
- **RoundedBox** for the inner body
- **ExtrudeGeometry** for colored face stickers
- Custom shapes for corners, edges, and centers

```typescript
type PieceType = 'corner' | 'edge' | 'center'

// Face sticker uses physical material
<meshPhysicalMaterial
  color={color}
  roughness={0.25}
  metalness={0.28}
  clearcoat={0.3}
  clearcoatRoughness={0.1}
  reflectivity={0.2}
/>
```

### Move Animation

Animations use `useFrame` for smooth layer rotation:

```typescript
useFrame((_, delta) => {
  if (currentAnimation.current) {
    // Rotate cubies in the layer
    const rotQuat = new THREE.Quaternion().setFromAxisAngle(axisVector, rotationStep)
    cubies.forEach(cubie => {
      cubie.position.applyAxisAngle(axisVector, rotationStep)
      cubie.quaternion.premultiply(rotQuat)
    })
  }
})
```

### Gyroscope Integration

The cube model follows physical cube orientation:

```typescript
useFrame((_, delta) => {
  if (groupRef.current && quaternionRef?.current) {
    groupRef.current.quaternion.slerp(quaternionRef.current, 15 * delta)
  }
})
```

---

## Smart Cube Integration

### Connection Flow

1. User clicks "Connect Cube"
2. Browser shows Bluetooth device picker
3. `gan-web-bluetooth` library handles connection
4. Subscribe to move and gyro events
5. Request initial battery and facelet state

### Event Handling

```typescript
const handleEvent = useCallback((event: GanCubeEvent) => {
  if (event.type === 'GYRO') {
    // Update quaternion ref
    const rawQuat = new THREE.Quaternion(x, z, -y, w)
    quaternionRef.current.copy(correctedQuat)
  } else if (event.type === 'MOVE') {
    onMoveRef.current?.(event.move)
  } else if (event.type === 'BATTERY') {
    setState(prev => ({ ...prev, batteryLevel: event.batteryLevel }))
  } else if (event.type === 'DISCONNECT') {
    // Handle disconnection
  }
}, [])
```

### Calibration Gestures

Quick calibration via move sequences:
- **U U U U** (4 U moves): Reset gyroscope
- **F F F F** (4 F moves): Sync cube state

```typescript
const checkCalibrationSequence = useCallback((move: string) => {
  // Track recent moves
  // Check for U4 or F4 pattern
  // Return 'gyro' or 'cube' calibration type
}, [])
```

---

## State Management

### Local State
- React `useState` for UI state
- `useRef` for performance-critical data
- `useMemo` for computed values

### Persistence
- `localStorage` for settings and solve history
- Automatic save on state changes

### Global State
- Theme via React Context (`ThemeProvider`)
- No external state library needed

---

## Data Flow

### Solve Recording Flow

```
GAN Cube → useGanCube.handleEvent() → onMove callback
                                           ↓
                                    App.handleMove()
                                           ↓
              ┌────────────────────────────┼────────────────────────────┐
              ↓                            ↓                            ↓
       trackMove()                  updateCubeState()             updateCubeFaces()
    (useScrambleTracker)              (useCubeState)               (useCubeFaces)
              ↓                            ↓                            ↓
    Update scramble progress      Update KPattern           Update face colors
              ↓                            ↓                            ↓
              └────────────────────────────┼────────────────────────────┘
                                           ↓
                              gyroRecorder.recordMove()
                                           ↓
                              Check if solved → stopTimer()
                                           ↓
                                    analyzeCFOP()
                                           ↓
                                    addSolve() → localStorage
```

### Render Flow

```
State Change → React re-render → useMemo computations
                                          ↓
                              useFrame (Three.js loop)
                                          ↓
                              Quaternion interpolation
                              Animation stepping
                                          ↓
                              GPU render frame
```

---

## Configuration

### Scene Configuration

Located in `src/config/scene-config.ts`:

```typescript
interface SceneConfig {
  light: {
    ambient: { intensity: number }
    directional1: { position: [x, y, z], intensity: number }
    directional2: { position: [x, y, z], intensity: number }
  }
  material: {
    face: { roughness, metalness, clearcoat, clearcoatRoughness, reflectivity }
    inner: { roughness, metalness }
  }
  camera: { position: [x, y, z], fov, minDistance, maxDistance }
  cube: { scale, cubeSize, gap }
  environment: { preset: 'sunset' | 'studio' | ... }
}
```

### Tailwind Configuration

Extended with shadcn color system:

```javascript
theme: {
  extend: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: { DEFAULT: '...', foreground: '...' },
      secondary: { ... },
      muted: { ... },
      accent: { ... },
      destructive: { ... },
    }
  }
}
```

---

## Development

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run format       # Prettier format
npm run format:check # Check formatting
```

### Adding a New Theme

1. Add theme definition to `src/lib/themes.ts`:

```typescript
myTheme: {
  name: 'My Theme',
  colors: {
    bg: '#...',
    bgSecondary: '#...',
    // ... all color properties
  }
}
```

2. Theme will automatically appear in Settings panel

### Adding a New Component

1. Create component file in appropriate folder
2. Use theme CSS variables for colors:

```tsx
style={{ 
  backgroundColor: 'var(--theme-bgSecondary)',
  color: 'var(--theme-text)'
}}
```

3. Use `cn()` utility for conditional classes:

```tsx
import { cn } from '@/lib/utils'

className={cn('base-classes', isActive && 'active-classes')}
```

---

## New Utilities & Architecture

### Centralized Types (`src/types/index.ts`)

All shared TypeScript types are now in a central location:

```typescript
import type { Solve, CFOPAnalysis, TimerStatus, TabType } from '@/types'
```

**Exported Types:**
- `TabType` - Navigation tab types
- `SolveViewMode` - Solve detail view modes
- `TimerStatus` - Timer states (idle/inspection/running/stopped)
- `GyroFrame` - Gyroscope data point
- `MoveFrame` - Move with timestamp
- `Solve` - Complete solve record
- `AppSettings` - Application settings
- `CFOPAnalysis` - Re-exported from cfop-analyzer

### Formatting Utilities (`src/lib/format.ts`)

Centralized formatting functions (no more duplicate `formatTime`):

```typescript
import { formatTime, formatDuration, formatTPS, formatDate, formatPercentage } from '@/lib/format'

formatTime(12345)        // "12.34"
formatDuration(2500)     // "2.50s"
formatTPS(5.5)           // "5.50"
formatDate('2024-01-01') // "Jan 1, 2024 10:30 AM"
formatPercentage(0.75)   // "75%"
```

### Constants (`src/lib/constants.ts`)

Shared constants eliminate magic values:

```typescript
import { 
  CUBE_COLORS, 
  CROSS_COLOR_MAP, 
  PHASE_COLORS, 
  CALIBRATION_SEQUENCE_TIMEOUT,
  IDEAL_CFOP_SPLITS 
} from '@/lib/constants'
```

### UI Components (`src/components/ui/`)

Reusable themed UI components:

```typescript
import { Button, Card, CardHeader, CardTitle, Kbd, IconButton, StatDisplay, StatRow } from '@/components/ui'
```

**Components:**
- `Card`, `CardHeader`, `CardTitle` - Consistent card styling
- `Kbd` - Keyboard key display
- `IconButton` - Animated icon buttons with variants
- `StatDisplay`, `StatRow` - Stat display components

### New Hooks

**`useKeyboardShortcuts`** - Declarative keyboard shortcuts:

```typescript
const shortcuts = [
  { key: 'F2', handler: resetGyro },
  { key: 'k', ctrlKey: true, handler: openPalette },
]
useKeyboardShortcuts(shortcuts)
```

**`useCalibrationSequence`** - Calibration gesture detection:

```typescript
const { calibrationType, resetSequence } = useCalibrationSequence(pattern)
// Detects U4 (gyro) and F4 (cube) calibration sequences
```

**`useSolveSession`** - Main session orchestration (reduces App.tsx complexity):

```typescript
const session = useSolveSession()
// Consolidates: cubeState, scrambleState, timer, solves, ganCube, calibration
```

---

## Performance Considerations

1. **Refs for High-Frequency Updates**: Quaternion and callbacks use refs
2. **Memoization**: Heavy computations wrapped in `useMemo`
3. **Animation Frame**: Three.js animations in `useFrame`
4. **Lazy Loading**: Cube library loaded asynchronously
5. **Debounced Renders**: State batching for multiple updates

---

## Browser Requirements

- **Web Bluetooth API**: Required for smart cube connection
- **WebGL 2**: Required for Three.js rendering
- **Modern Browser**: Chrome/Edge recommended for Bluetooth
