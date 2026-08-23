---
name: awesome-design-md
description: Apply brand design systems and Stitch DESIGN.md specifications to frontend applications. Use when asked to "style like Stripe", "use Linear design system", "create a DESIGN.md", "apply brand theme", or adopt styles from 59+ industry leaders (Apple, Vercel, Coinbase, Revolut, Supabase, Nike, etc.).
metadata:
  author: VoltAgent
  version: "1.0.0"
---

# Awesome DESIGN.md - Design System Protocol

A curated protocol and library of `DESIGN.md` design system specifications. Allows AI agents to accurately replicate the visual style, typography, color palette, elevation, and component behaviors of top industry brands without Figma exports or complex JSON schemas.

---

## 1. The 9-Section `DESIGN.md` Protocol

Every `DESIGN.md` follows the Google Stitch standard specification across 9 key areas:

| # | Section | What It Captures |
|---|---|---|
| 1 | **Visual Theme & Atmosphere** | Philosophy, mood, visual density, contrast philosophy, emotional tone |
| 2 | **Color Palette & Roles** | Semantic color naming, HEX values, primary/secondary/accent/surface/border roles |
| 3 | **Typography Rules** | Font family pairings, weight hierarchy, size scale, line heights, letter spacing |
| 4 | **Component Stylings** | Buttons, cards, inputs, dropdowns, navigation (default, hover, active, focus, disabled) |
| 5 | **Layout Principles** | Spacing scale (4px/8px grid), container max-widths, whitespace & padding rules |
| 6 | **Depth & Elevation** | Surface hierarchy (level-0 to level-3), shadow formulas, borders vs drop shadows |
| 7 | **Do's and Don'ts** | Guardrails, forbidden styling practices, anti-patterns |
| 8 | **Responsive Behavior** | Breakpoints (sm, md, lg, xl), touch targets (min 44px), mobile collapsing |
| 9 | **Agent Prompt Guide** | Quick token summary and ready-to-use system prompts |

---

## 2. Supported Brand Archetypes & Profiles

### 💎 Fintech & Precision
- **Stripe**: Signature purple/violet gradients, weight-300 typography, ultra-refined borders, subtle colored glow drop-shadows.
- **Coinbase**: Clean trust-first blue identity (`#0052FF`), rounded cards, institutional clarity, high-contrast surfaces.
- **Revolut**: Pitch-black sleek background (`#0A0A0C`), vibrant neon gradient highlights, glass cards, fintech precision.
- **Binance**: Binance Gold (`#F0B90B`) accents on charcoal dark theme, dense data layout, high-urgency market indicators.

### ⚡ Developer Tools & SaaS
- **Linear**: High-density dark canvas (`#121316`), crisp 1px borders (`rgba(255,255,255,0.08)`), keyboard-first shortcuts, subtle purple-indigo accents, monospace numbers.
- **Vercel**: Strict monochrome (pure black `#000000` & pure white `#ffffff`), geometric minimalism, Geist font, razor-sharp corners, high contrast.
- **Supabase**: Deep slate canvas (`#1C1C1C`), emerald green accent (`#3ECF8E`), hacker-aesthetic cards, clear monospaced code blocks.
- **Raycast**: Deep charcoal dark mode, vibrant ruby/crimson/cyan gradient badges, pill-shaped command palettes, keyboard-driven UI.

### 🎨 Design & Creative
- **Apple**: Radical whitespace, SF Pro typography, cinematic imagery, subtle frosted glass (`backdrop-filter`), precise micro-radius.
- **Figma**: Multi-color playful accents (orange, purple, blue, green), friendly rounded pills, clean light/dark canvas.
- **Framer**: Bold black & electric blue, motion-first interactions, fluid layout grids, modern typography.

---

## 3. How to Apply in Code

### Step 1: Read or Define `DESIGN.md`
When styling a project or page, inspect the project's `DESIGN.md` or declare the target brand profile in the CSS root tokens:

```css
:root {
  /* Brand Tokens: Example Linear-Style */
  --bg-primary: #0d0e11;
  --bg-secondary: #16181d;
  --bg-tertiary: #1f2229;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  --text-primary: #f7f8f8;
  --text-secondary: #8a8f98;
  --text-muted: #5e626e;
  --accent: #5e6ad2;
  --accent-hover: #6d78e3;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

### Step 2: Enforce Component Aesthetics
- Avoid generic default styles.
- Match borders, shadows, focus rings, and typography precisely to the brand token spec.
- Maintain consistent padding ratios (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`).

### Step 3: Fetching Live Specs
If a user requests a specific brand's `DESIGN.md`:
```
https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/<brand-name>/DESIGN.md
```
*(e.g., `stripe`, `linear.app`, `vercel`, `apple`, `revolut`, `supabase`, `coinbase`)*
