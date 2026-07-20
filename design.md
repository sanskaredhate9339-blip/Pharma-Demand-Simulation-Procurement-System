# Design — Aegis Flow

A locked design system for this app. Every page and component redesign reads this file before emitting code. Do not regenerate per component — extend or amend this file when the system needs to grow.

## Genre
modern-minimal

## Macrostructure family
- Onboarding / Upload view: `Marquee Hero` (minimal, typography-centered)
- Dashboard / Workspace view: `Workbench` (modular data panels, tabular typography, sharp borders)

## Theme
- `--color-paper`        oklch(98% 0.01 85)    /* Warm cream white */
- `--color-paper-2`      oklch(95% 0.012 85)   /* Slightly darker panel base */
- `--color-paper-3`      oklch(92% 0.015 85)   /* Border hover or input focus background */
- `--color-ink`          oklch(15% 0.02 85)    /* Dark warm grey text */
- `--color-ink-2`        oklch(45% 0.015 85)   /* Medium grey secondary text */
- `--color-rule`         oklch(85% 0.02 85)    /* Light divider/border */
- `--color-rule-hover`   oklch(75% 0.025 85)   /* Interactive borders (hover) */
- `--color-accent`       oklch(65% 0.15 145)    /* Clinical mint accent (adjusted for light) */
- `--color-accent-ink`   oklch(98% 0.01 85)    /* Light text on top of clinical mint */
- `--color-focus`        oklch(55% 0.18 145)    /* High-contrast focus state */

## Typography
- Display: *Outfit*, weight 500-700, style normal, tracking -0.02em
- Body: *Inter*, weight 400-600, style normal
- Mono: *JetBrains Mono*, weight 400-600 (used for code, numbers, metrics, dates, and tables)
- Type scale anchor: `--text-display` = clamp(2.5rem, 5vw + 0.5rem, 4.75rem)

## Spacing
4-point named scale. Pages must use named custom property tokens (`var(--space-md)`), never raw/arbitrary values.

## Motion
- Easings: `cubic-bezier(0.16, 1, 0.3, 1)` named `--ease-out`
- Reveal pattern: none (components render instantly to preserve clean SaaS application feel)

## Microinteractions stance
- Focus is first-class. Every focusable element must have a clear `:focus-visible` state.
- Hover animations use snappy durations (`150ms-220ms`) and `--ease-out`.

## CTA voice
- Primary CTA: Filled Clinical Mint button with text colored as `--color-accent-ink`, tight borders (`6px` border-radius).
- Secondary CTA: Outlined slate border, text colored as `--color-ink`, hover background shifts to `--color-paper-3`.

## Per-page allowances
- Onboarding Screen (FileUploader): Allowed to use a stylized upload zone with active animations on valid upload.
- Dashboard Workspace: Data-dense, typography-only layout. No decorative art, drawings, or standard purple glows.

## What pages MUST share
- The Aegis Flow logotype.
- The accent color and its minimal placement (<= 5% of viewport footprint).
- The Display, Body, and Mono font stacks.
- The CTA button voice (6px border-radius, same padding rhythm, uppercase or sentence case text).

## What pages MAY differ on
- Layout components based on the active state (upload onboarding vs. dashboard analytics).

---

## Exports

### tokens.css
```css
:root {
  --color-paper:        oklch(98% 0.01 85);
  --color-paper-2:      oklch(95% 0.012 85);
  --color-paper-3:      oklch(92% 0.015 85);
  --color-ink:          oklch(15% 0.02 85);
  --color-ink-2:        oklch(45% 0.015 85);
  --color-rule:         oklch(85% 0.02 85);
  --color-rule-hover:   oklch(75% 0.025 85);
  --color-accent:       oklch(65% 0.15 145);
  --color-accent-ink:   oklch(98% 0.01 85);
  --color-focus:        oklch(55% 0.18 145);

  --font-display: "Outfit", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  --space-3xs: 0.25rem;  --space-2xs: 0.5rem;  --space-xs: 0.75rem;
  --space-sm:  1rem;     --space-md:  1.5rem;  --space-lg: 2rem;
  --space-xl:  3rem;     --space-2xl: 4.5rem;  --space-3xl: 7rem;

  --text-xs: 0.75rem;  --text-sm: 0.875rem; --text-md: 1rem;
  --text-lg: 1.125rem; --text-xl: 1.25rem;  --text-2xl: 1.5rem;  --text-3xl: 1.875rem;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-short: 150ms;
  --dur-normal: 220ms;
  
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

### Tailwind v4 `@theme`
```css
@theme {
  --color-paper:        oklch(98% 0.01 85);
  --color-paper-2:      oklch(95% 0.012 85);
  --color-paper-3:      oklch(92% 0.015 85);
  --color-ink:          oklch(15% 0.02 85);
  --color-ink-2:        oklch(45% 0.015 85);
  --color-rule:         oklch(85% 0.02 85);
  --color-rule-hover:   oklch(75% 0.025 85);
  --color-accent:       oklch(65% 0.15 145);
  --color-accent-ink:   oklch(98% 0.01 85);
  --color-focus:        oklch(55% 0.18 145);

  --font-display: "Outfit", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;

  --spacing-3xs: 0.25rem; --spacing-2xs: 0.5rem; --spacing-xs: 0.75rem;
  --spacing-sm:  1rem;    --spacing-md:  1.5rem; --spacing-lg: 2rem;
  --spacing-xl:  3rem;    --spacing-2xl: 4.5rem; --spacing-3xl: 7rem;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

### DTCG `tokens.json`
```json
{
  "color": {
    "paper":  { "$value": "oklch(98% 0.01 85)", "$type": "color" },
    "ink":    { "$value": "oklch(15% 0.02 85)", "$type": "color" },
    "accent": { "$value": "oklch(65% 0.15 145)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Outfit", "$type": "fontFamily" },
    "body":    { "$value": "Inter", "$type": "fontFamily" }
  },
  "space": {
    "md": { "$value": "1.5rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables
```css
:root {
  --background:        98%  0.01   85;    /* paper */
  --foreground:        15%  0.02   85;    /* ink */
  --primary:           65%  0.15   145;   /* accent */
  --primary-foreground: 98%  0.01   85;    /* accent-ink */
  --muted:             85%  0.02   85;    /* rule */
  --muted-foreground:  45%  0.015  85;    /* muted */
  --border:            85%  0.02   85;    /* rule */
  --input:             85%  0.02   85;    /* rule */
  --ring:              55%  0.18   145;   /* focus */
  --radius:            6px;
}
```
