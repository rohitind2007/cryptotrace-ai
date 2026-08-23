---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review UI and frontend files for compliance with Web Interface Guidelines.

## How It Works

1. Read the specified files or directory (e.g. React/TSX/HTML/CSS components).
2. Check against all rules in the guidelines below.
3. Output findings in the terse, actionable `file:line` format.

## Comprehensive Guidelines & Rules

### Accessibility

- **Icon-only buttons**: Must have `aria-label` or `aria-labelledby`.
- **Form controls**: Must have associated `<label>` (via `htmlFor`) or `aria-label`.
- **Keyboard navigation**: Interactive elements need keyboard handlers (`onKeyDown`/`onKeyUp`) and proper tab indexing.
- **Semantic elements**: Use `<button>` for actions, `<a>`/`<Link>` for navigation (never `<div onClick>`).
- **Image alt text**: All `<img>` elements need descriptive `alt` attributes (or `alt=""` explicitly if purely decorative).
- **Decorative icons**: Add `aria-hidden="true"` to SVGs and decorative icons.
- **Async updates**: Toast notifications and dynamic live validation need `aria-live="polite"`.
- **Semantic hierarchy**: Headings must follow a logical `<h1>`–`<h6>` structure; include skip links for main content.
- **Anchor scrolling**: Ensure `scroll-margin-top` on heading anchors to avoid being obscured by sticky headers.
- **Media accessibility**: Meaningful audio/video needs captions, transcripts, or descriptions.

### Focus States

- **Visible focus**: Interactive elements must have visible focus rings (`focus-visible:ring-2` or equivalent).
- **No outline removal without replacement**: Never use `outline-none` or `outline: 0` without a visible `:focus-visible` replacement.
- **Focus vs Click**: Prefer `:focus-visible` over `:focus` to prevent unsightly focus rings on mouse click while preserving keyboard focus.
- **Compound controls**: Group focus with `:focus-within`.
- **Overlays & sticky headers**: Sticky elements must never obscure currently focused elements.

### Forms & Inputs

- **Autocomplete & Names**: Inputs need semantic `autocomplete` attributes and descriptive `name` attributes.
- **Appropriate Input Types**: Use correct `type` (`email`, `tel`, `url`, `number`) and `inputmode` (`numeric`, `decimal`).
- **Never block paste**: Do not intercept `onPaste` with `preventDefault()`.
- **Hit targets**: Checkboxes and radio buttons must share a single generous hit target with their labels (no dead zones).
- **Spellcheck**: Explicitly disable spellcheck on emails, promo codes, and usernames (`spellCheck={false}`).
- **Submit states**: Submit buttons should stay enabled until request starts; show an inline loading spinner/indicator during requests.
- **Validation**: Inline errors next to fields; automatically focus first error on submit attempt.
- **Placeholders**: Placeholders end with an ellipsis `…` and show an example pattern, not replace labels.
- **Disable non-auth autofill**: Use `autocomplete="off"` on non-auth fields to prevent unwanted password manager popups.

### Animation & Motion

- **Reduced motion**: Always respect `prefers-reduced-motion` (disable motion or provide a reduced instant transition).
- **GPU-accelerated properties**: Animate `transform` and `opacity` only (avoid animating `width`, `height`, `margin`, `top`).
- **Never `transition: all`**: Always list explicit transitioned properties (e.g. `transition-colors`, `transition-transform`).
- **Transform origin**: Set explicit `transform-origin` when scaling or rotating.
- **Interruptible animations**: UI animations must remain responsive and interruptible on user input.
- **Autoplay control**: Any autoplay motion lasting >5 seconds must have pause/play controls.

### Typography & Formatting

- **Punctuation**: Use real ellipsis `…` instead of three periods `...`.
- **Quotes**: Use curly quotes `“` `”` / `‘` `’` rather than straight quotes `"` `'`.
- **Non-breaking spaces**: Use non-breaking spaces for units (`10&nbsp;MB`, `5&nbsp;km`) and brand names.
- **Loading copy**: Loading states end with ellipsis: `"Loading…"`, `"Saving…"`.
- **Tabular numbers**: Use `font-variant-numeric: tabular-nums` or `font-mono` for financial amounts, countdowns, and table data.
- **Text wrap**: Use `text-wrap: balance` or `text-wrap: pretty` on headlines to prevent awkward orphan words.

### Content Handling & Overflow

- **Long text truncation**: Text containers must handle dynamic length gracefully (`truncate`, `line-clamp-2`, or `break-words`).
- **Flex child shrinking**: Add `min-w-0` to flex child containers so text truncation works properly.
- **Empty states**: Never render blank or broken UI for empty lists/strings; always provide an empty state illustration/message.

### Images & Media

- **Dimensions**: Every `<img>` tag must have explicit `width` and `height` (or aspect-ratio) to eliminate Cumulative Layout Shift (CLS).
- **Lazy loading**: Below-the-fold images should use `loading="lazy"`.
- **Hero/Above-fold**: Above-the-fold hero images should use `fetchpriority="high"` or `priority`.
- **Video vs GIF**: Prefer `<video autoplay muted loop playsinline>` over heavy animated GIFs.

### Performance

- **List virtualization**: Large lists (>50 items) should use virtualization.
- **Avoid layout thrashing**: Do not perform layout reads (`getBoundingClientRect`, `offsetHeight`) inside render cycles.
- **Asset preconnect**: Add `<link rel="preconnect">` for CDN and critical external domains.
- **Font preloading**: Preload critical fonts with `font-display: swap`.

### Navigation & State

- **URL as source of truth**: Filters, active tabs, modals, and search queries should sync with URL search params.
- **Native Link navigation**: Links must use standard `<a>` or framework `<Link>` tags to support Cmd/Ctrl+Click and middle-click.
- **Destructive actions**: Destructive actions (deletions, revokes) require confirmation dialogs or undo grace windows.

### Dark Mode & Theming

- **Color scheme tag**: Add `<meta name="color-scheme" content="dark light">` or set `color-scheme: dark` on root HTML.
- **Theme color**: Sync `<meta name="theme-color">` with background color.
- **Native controls**: Explicitly style native `<select>` backgrounds and text colors for Windows dark mode compatibility.

---

## Output Format

Group findings by file using the `file:line` syntax:

```text
## src/components/Header.tsx

src/components/Header.tsx:42 - icon button missing aria-label
src/components/Header.tsx:67 - transition: all used; list properties explicitly

## src/components/SettingsModal.tsx

src/components/SettingsModal.tsx:18 - input lacks associated label or aria-label
src/components/SettingsModal.tsx:55 - animation missing prefers-reduced-motion check
```
