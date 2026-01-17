# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

dhanKit is a financial calculator website for Indian retail investors and salaried professionals. Domain: dhankit.com

## Tech Stack

- **Framework:** Next.js 16.1 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4.1 (CSS-based config, not JS)
- **Components:** shadcn/ui
- **Charts:** Recharts 3.6
- **Hosting:** Vercel

## Build & Development Commands

```bash
# Install dependencies
npm install

# Development server (Turbopack enabled by default)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Add shadcn components
npx shadcn@latest add <component-name>
```

## Issue Tracking (beads)

This project uses **bd** (beads) for issue tracking instead of GitHub Issues.

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd create "title"     # Create new issue
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

**Critical:** Work is NOT complete until `git push` succeeds. Always run `bd sync && git push` before ending a session.

## Architecture

### Tailwind v4 Configuration

Tailwind v4 uses CSS-based configuration in `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #10B981;
  --color-primary-dark: #059669;
  /* ... */
}
```

Do NOT look for `tailwind.config.js` - it doesn't exist in Tailwind v4.

### File Structure

```
app/
├── layout.tsx
├── page.tsx                    # Homepage with calculator grid
├── about/page.tsx
├── sip-calculator/page.tsx
├── emi-calculator/page.tsx
├── ppf-calculator/page.tsx
├── fd-calculator/page.tsx
├── lumpsum-calculator/page.tsx
└── nps-calculator/page.tsx

components/
├── layout/                     # Header, Footer, CalculatorCard
├── calculator/                 # Shared calculator components
│   ├── CalculatorLayout.tsx
│   ├── InputSlider.tsx
│   ├── ResultCard.tsx
│   ├── DonutChart.tsx
│   ├── BreakdownTable.tsx
│   └── InfoSection.tsx
└── ui/                         # shadcn components

lib/
├── calculators/                # Calculator logic (sip.ts, emi.ts, etc.)
└── format.ts                   # Indian currency formatting
```

### Shared Calculator Components

Every calculator page uses consistent components:
- `CalculatorLayout` - Wraps all calculators with header, SEO
- `InputSlider` - Slider + input combo with label formatting
- `ResultCard` - Displays primary result prominently
- `DonutChart` - Recharts 3.x PieChart for invested vs returns
- `BreakdownTable` - Year-by-year expandable table

## Critical Implementation Details

### Indian Number Formatting

**Always use Indian numbering system:**
- 1,00,000 (1 lakh) NOT 100,000
- 1,00,00,000 (1 crore) NOT 10,000,000

```typescript
function formatIndianCurrency(num: number): string {
  return num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR'
  });
}
```

### Font Usage

- Labels/text: `font-sans` (Geist Sans)
- Currency/numbers: `font-mono` (Geist Mono for tabular alignment)

### Design Principles

1. Calculate on input change - no submit buttons
2. Mobile-first (70%+ traffic expected from mobile)
3. Result should be the visual hero
4. Minimum touch targets: 44x44px on mobile

### Recharts 3.x Notes

Recharts 3.x uses `shape` prop instead of deprecated `activeShape`/`inactiveShape`.

### Inflation Adjustment Feature

Investment calculators (SIP, Lumpsum, FD) should include an inflation adjustment toggle that shows:

1. **Inflation-adjusted maturity value**: The future corpus in today's purchasing power
   ```typescript
   const inflationAdjustedValue = maturityAmount / Math.pow(1 + inflationRate / 100, years);
   ```

2. **Real interest rate**: The effective return after accounting for inflation (Fisher equation)
   ```typescript
   const realRate = ((1 + nominalRate / 100) / (1 + inflationRate / 100) - 1) * 100;
   ```

3. **URL params**: `inf=1` (toggle), `infr=6` (rate, default 6%)

4. **Display**: Use `ResultCard` with:
   - `secondaryValue`: Inflation-adjusted maturity amount
   - `tertiaryValue`: Real interest rate with `variant: "destructive"` when negative

5. **Breakdown table**: Add `inflationAdjustedValue` column when inflation is enabled

### Shareable Links & Open Graph

Every calculator must support shareable links with dynamic OG metadata:

1. **URL State**: Store calculator inputs in URL query params (e.g., `?m=10000&r=12&y=15`)
   - Use short param names to keep URLs compact
   - Only include non-default values in URL
   - Initialize state from URL params on page load

2. **Page Structure**: Split into server and client components
   - `page.tsx` - Server component with `generateMetadata()` for dynamic OG tags
   - `[Calculator].tsx` - Client component with `"use client"` for interactivity
   - Wrap client component in `<Suspense>` for loading state

3. **Dynamic Metadata**: Generate based on URL params
   - Title: `₹10,000/month SIP → ₹23.23 L in 10 years | dhanKit`
   - Description: Full calculation summary
   - OG Image: `/api/og/[calculator]?params...`

4. **OG Image API Route**: Create at `/app/api/og/[calculator]/route.tsx`
   - Use `@vercel/og` with edge runtime
   - Load Noto Sans font for rupee symbol support
   - Include the logo from `/public/logo.png`
   - Display inputs and calculated results
   - Size: 1200x630px

5. **Share Button**: Add "Share This Calculation" button that copies URL to clipboard

Example OG image route pattern:
```typescript
import { ImageResponse } from "@vercel/og";
export const runtime = "edge";
const fontUrl = "https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf";
```

## MVP Calculators

Six calculators with specific formulas defined in PRD.md:
- SIP Calculator - Monthly investment returns
- EMI Calculator - Loan EMI with amortization
- PPF Calculator - Public Provident Fund (15-year lock-in, ₹1.5L max/year)
- FD Calculator - Fixed deposit with compounding options
- Lumpsum Calculator - One-time investment returns
- NPS Calculator - National Pension System (60/40 split at retirement)

## Articles & Related Calculators

Articles are stored in `_posts/<slug>/post.md` as markdown with frontmatter.

### Linking Calculators to Articles

Each article has a `calculators` array in its frontmatter that determines which calculators appear in the "Related Articles" section:

```yaml
---
title: "Power of Compounding: How ₹5,000 SIP Becomes ₹1 Crore"
description: "..."
calculators:
  - sip-calculator
  - cost-of-delay-calculator
icon: "📈"
---
```

**When adding a new calculator**, find relevant articles and add the calculator slug to their `calculators` array. Good candidates:
- Articles about the same financial concept
- Articles mentioning time value of money, early investing, or compound growth
- Articles targeting the same audience (e.g., salaried employees, retirees)

The relationship is bidirectional:
- Calculator pages show related articles via `<RelatedArticles currentCalculator="/sip-calculator" />`
- Article pages show related calculators via the same component

### Article File Structure

```
_posts/
├── power-of-compounding-sip/
│   └── post.md
├── build-1-crore-retirement-corpus/
│   └── post.md
└── ...
```

## Browser Support

Tailwind v4 requires:
- Safari 16.4+
- Chrome 111+
- Firefox 128+
