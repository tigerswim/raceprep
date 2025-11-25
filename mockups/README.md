# RacePrep Design System Mockups

Three distinct visual design concepts for RacePrep that break away from typical vibe-coded aesthetics while maintaining a modern, dynamic, energetic feel focused on athletic performance.

## 📁 Files

- **concept-1-split-flap.html** - Split-Flap Terminal concept
- **concept-2-scoreboard.html** - Stadium Scoreboard concept
- **concept-3-command-center.html** - Race Command Center concept
- **README.md** - This file

## 🚀 How to View

### Method 1: Double-Click (Easiest)
Simply double-click any HTML file to open it in your default browser.

### Method 2: Open with Specific Browser
Right-click the HTML file → "Open With" → Choose your preferred browser (Chrome, Safari, Firefox)

### Method 3: From Terminal
```bash
cd "/Users/danhoeller/Website Development/kineticbrandpartners/RacePrep/mockups"

# macOS - open in default browser
open concept-1-split-flap.html

# Or open in specific browser
open -a "Google Chrome" concept-1-split-flap.html
open -a "Safari" concept-2-scoreboard.html
open -a "Firefox" concept-3-command-center.html
```

### Method 4: Live Server (Best for Development)
If you have VS Code or similar editor:
1. Install "Live Server" extension
2. Right-click HTML file → "Open with Live Server"
3. Mockup will open at http://localhost:5500

## 📱 Interactive Features

All mockups include:
- **Tab Navigation** - Click Dashboard/Races tabs to switch views
- **Hover States** - Hover over elements to see interactive effects
- **Animations** - Data reveals and transitions on load
- **Responsive Design** - Resize browser window to see mobile/tablet layouts

### Testing Responsive Views

**Chrome DevTools:**
1. Open mockup in Chrome
2. Press F12 (or Cmd+Option+I on Mac)
3. Click "Toggle Device Toolbar" icon (or Cmd+Shift+M)
4. Select device presets: iPhone 13, iPad, Desktop

**Safari:**
1. Open mockup in Safari
2. Press Cmd+Option+I
3. Choose "Responsive Design Mode"

**Breakpoints to test:**
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1024px+ width

## 🎨 Concept Comparison

### Concept 1: Split-Flap Terminal
**Inspiration:** Airport departure boards, vintage race timing systems

**Visual Identity:**
- **Colors:** Deep navy-black background, cream white text, warm yellow accents
- **Sport Colors:** Cyan swim, coral bike, turquoise run
- **Typography:** SF Mono, monospace everywhere
- **Shapes:** Hard rectangles, NO rounded corners, segmented displays
- **Texture:** Horizontal scan lines, subtle glow on numbers

**Key Features:**
- Flip-card countdown animation (airport board style)
- 7-segment LED numbers for transition times
- Terminal-style horizontal training bars
- Fixed-width tabular race splits
- Monospace precision aesthetic

**Best For:** Clarity, character, retro-futuristic feel

---

### Concept 2: Stadium Scoreboard
**Inspiration:** NBA arena scoreboards, LED displays, Times Square

**Visual Identity:**
- **Colors:** Pure black background, LED colors (red, green, amber, white)
- **Sport Colors:** Electric blue swim, orange bike, lime run
- **Typography:** Impact, Arial Black (bold, condensed)
- **Shapes:** Thick borders (4-8px), modular panels, rounded outer containers
- **Texture:** LED glow effects, dot matrix pattern background

**Key Features:**
- Giant LED countdown with intense glow effects
- Chunky color blocks for training volume
- Side-by-side T1/T2 panels with status dots
- Bold leaderboard with heavy grid structure
- High-energy pulsing animations

**Best For:** Impact, excitement, high-energy sports atmosphere

---

### Concept 3: Race Command Center
**Inspiration:** NASA control rooms, F1 pit telemetry, military mission control

**Visual Identity:**
- **Colors:** Deep space grey background, technical blue accents
- **Sport Colors:** Cyan swim, orange bike, green run (evolved palette)
- **Typography:** Inter (clean sans), JetBrains Mono (data)
- **Shapes:** Small corners (4-8px), thin borders (1px), angular chamfers
- **Texture:** Subtle noise, thin grid overlay, blueprint aesthetic

**Key Features:**
- Gantt chart training timeline with grid lines
- Clinical telemetry panels for T1/T2 with efficiency metrics
- Nested panel system with subtle depth
- Dense data tables with clean hierarchy
- Professional, technical precision

**Best For:** Data enthusiasts, technical users, professional aesthetic

## 🎯 Design Philosophy Comparison

| Aspect | Split-Flap | Scoreboard | Command Center |
|--------|------------|------------|----------------|
| **Vibe** | Retro-precise | Bold-exciting | Technical-professional |
| **Data Density** | Moderate | Low (chunky) | High (compact) |
| **Visual Impact** | Medium | Very High | Medium-Low |
| **Professionalism** | Medium-High | Low-Medium | Very High |
| **Readability** | Excellent | Good | Excellent |
| **Uniqueness** | Very High | High | Medium-High |
| **Mobile-Friendly** | Excellent | Good | Excellent |

## ✅ What Makes These Non-Vibe-Coded

All three concepts **completely eliminate:**
- ❌ Glassmorphism (backdrop-blur)
- ❌ Blue-to-orange gradients everywhere
- ❌ Floating blur orbs in background
- ❌ Excessive rounded corners
- ❌ Trendy 2024 aesthetics

Instead, they embrace:
- ✅ Strong visual identity and point of view
- ✅ Functional design serving data comprehension
- ✅ Athletic/performance-focused aesthetics
- ✅ Timeless design principles
- ✅ Custom visualizations specific to triathlon

## 🔧 Technical Implementation Notes

### React Native Translation

Each concept can be implemented in React Native using:

**Split-Flap:**
- Scan lines: 1px height View with opacity
- Flip animation: React Native Reanimated `rotateX`
- Hard rectangles: `borderRadius: 0`
- Monospace: `fontFamily: 'Courier'` or `'Menlo'`

**Scoreboard:**
- LED glow: Multiple `shadowColor` layers on Text
- Thick borders: `borderWidth: 4-8`
- Modular panels: Nested Views with gaps
- Dot pattern: Background Image or SVG

**Command Center:**
- Grid overlay: Absolute positioned View with lines
- Angular chamfers: SVG `clipPath`
- Thin borders: `borderWidth: 1`
- Nested panels: Multiple View layers with spacing

### NativeWind Classes

All designs use patterns compatible with NativeWind (Tailwind CSS for React Native):

**Split-Flap:**
```jsx
className="bg-[#0A0E14] border-2 border-[#1C2127] font-mono text-[#F8F8F2]"
```

**Scoreboard:**
```jsx
className="bg-black border-6 border-[#333333] rounded-3xl p-7"
```

**Command Center:**
```jsx
className="bg-[#14181D] border border-[#2A3139] rounded-lg p-5"
```

## 📊 Data Visualization Approaches

### Split-Flap Terminal
- **Training Volume:** Horizontal bars with solid fill, hard edge indicators
- **Transitions:** 7-segment display numbers with glow
- **Race Timeline:** Fixed-width table with monospace alignment
- **Best For:** Quick scanning, precise times

### Stadium Scoreboard
- **Training Volume:** Chunky stacked color blocks
- **Transitions:** Giant LED numbers with side-by-side panels
- **Race Timeline:** Heavy-bordered table rows
- **Best For:** High-impact visuals, excitement

### Command Center
- **Training Volume:** Gantt timeline with grid overlay
- **Transitions:** Clinical telemetry readouts with status badges
- **Race Timeline:** Progress bars with precise labels
- **Best For:** Detailed analysis, data exploration

## 🎨 Color Evolution

Each concept evolves the sport color coding:

**Current RacePrep:**
- Swim: Blue #3B82F6
- Bike: Orange #F97316
- Run: Green #10B981

**Split-Flap Terminal:**
- Swim: Cyan #00D4FF (brighter, terminal-like)
- Bike: Coral #FF6B35 (warmer, more vintage)
- Run: Turquoise #4ECDC4 (distinct from swim)

**Stadium Scoreboard:**
- Swim: Electric Blue #00BFFF (LED intensity)
- Bike: Orange #FF6600 (pure LED orange)
- Run: Lime #7FFF00 (bright LED green)

**Command Center:**
- Swim: Cyan #06B6D4 (technical, Tailwind cyan-500)
- Bike: Orange #F97316 (keeps current)
- Run: Green #22C55E (Tailwind green-500)

## 🚀 Next Steps

1. **Review all three mockups** in your browser
2. **Test responsiveness** by resizing window
3. **Compare side-by-side** by opening multiple tabs
4. **Share with team/users** for feedback
5. **Select winning concept** for implementation

Once a concept is selected:
- Update `tailwind.config.js` with new color palette
- Refactor dashboard widgets to match chosen aesthetic
- Implement unique visualizations (Gantt charts, LED displays, etc.)
- Update component library (buttons, cards, badges)
- Apply consistently across all screens

## 📝 Feedback Questions

When reviewing, consider:
1. Which concept best represents RacePrep's brand?
2. Which data visualizations are most effective?
3. Which aesthetic resonates with target users (beginner-intermediate triathletes)?
4. Which feels most "performance-focused" vs "lifestyle/wellness"?
5. Which would you be most excited to use after a race?

## 📸 Screenshots

To capture screenshots for sharing:
- **macOS:** Cmd+Shift+4, then spacebar, click window
- **Windows:** Windows+Shift+S
- **Chrome:** F12 → Device Toolbar → Screenshot icon

## 🔗 References

**Current RacePrep Files:**
- `src/components/dashboard/` - Current widget implementations
- `tailwind.config.js` - Current color system
- `src/components/ui/` - Current component library

**Documentation:**
- Plan file: `~/.claude/plans/functional-watching-backus.md`
- RacePrep README: `../README.md`
- Claude instructions: `../CLAUDE.md`

---

**Built with:** Pure HTML/CSS (no frameworks)
**Browser Support:** Chrome, Safari, Firefox (latest versions)
**Mobile Support:** Responsive breakpoints at 640px, 768px, 1024px
**Created:** January 2025
**Estimated Implementation Time:** 3-4 hours per concept in React Native

---

Enjoy exploring the concepts! 🏊‍♂️🚴‍♂️🏃‍♂️