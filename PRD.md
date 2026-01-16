# DhanKit - Product Requirements Document

## Executive Summary

**Product:** DhanKit - Financial calculators for Indians
**Domain:** dhankit.com
**Tagline:** "Smart calculators for smarter financial decisions"

DhanKit is a clean, modern financial calculator website targeting Indian retail investors and salaried professionals. The focus is on exceptional UX, consistent design patterns, and helpful visualizations that make financial planning intuitive.

---

## Tech Stack

### Core
- **Framework:** Next.js 16.1 (App Router, Turbopack stable)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4.1
- **Components:** shadcn/ui (updated for Next.js 16 + Tailwind v4)
- **Charts:** Recharts 3.6
- **Hosting:** Vercel

### Setup Commands
```bash
# Create Next.js 16 project
npx create-next-app@latest dhankit --typescript --tailwind --eslint --app
cd dhankit

# Initialize shadcn/ui (will auto-detect Next.js 16 + Tailwind v4)
npx shadcn@latest init

# Install Recharts 3.x
npm install recharts
```

### shadcn Components Needed
```bash
npx shadcn@latest add button input label card slider tabs table
```

### Tailwind v4 Notes
Tailwind v4 uses CSS-based configuration instead of `tailwind.config.js`. Configuration is done directly in your CSS file:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #10B981;
  --color-primary-dark: #059669;
  --color-secondary: #6366F1;
}
```

### Next.js 16 Notes
- Turbopack is now stable and enabled by default for `next dev`
- Use `"use cache"` directive for explicit caching (opt-in, no implicit caching)
- React 19 stable APIs (Actions, Suspense, concurrent rendering)

---

## Design System

### Brand Colors (Tailwind v4 CSS Theme)
```css
/* Define in app/globals.css using Tailwind v4 @theme */
@theme {
  /* Primary - Emerald green (money/growth) */
  --color-primary: #10B981;
  --color-primary-dark: #059669;
  --color-primary-light: #34D399;

  /* Secondary - Indigo (trust/stability) */
  --color-secondary: #6366F1;
  --color-secondary-dark: #4F46E5;

  /* Neutrals */
  --color-background: #FAFAFA;
  --color-card: #FFFFFF;
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-border: #E5E7EB;

  /* Semantic */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
}
```

Usage in components: `bg-primary`, `text-primary-dark`, `border-border`, etc.

### Typography
- **Headings & Body:** Geist Sans (system font stack fallback)
- **Numbers & Data:** Geist Mono (perfect tabular alignment)
- **Installation:** `npm install geist` (ships with Next.js 16)

### Design Principles
1. **Generous whitespace** - Don't cram inputs together
2. **Clear visual hierarchy** - Result should be the hero
3. **Consistent patterns** - Every calculator feels familiar
4. **Mobile-first** - 70%+ traffic will be mobile
5. **Instant feedback** - Calculate on input change, no submit buttons

---

## Site Structure

```
/                       # Homepage with calculator grid
/sip-calculator         # Individual calculator pages
/emi-calculator
/ppf-calculator
/fd-calculator
/lumpsum-calculator
/nps-calculator
/about                  # About page (simple)
```

### Homepage Layout
```
┌─────────────────────────────────────────────┐
│  Logo                            [About]    │
├─────────────────────────────────────────────┤
│                                             │
│     Smart calculators for smarter           │
│     financial decisions                     │
│                                             │
│     [Search calculators...]                 │
│                                             │
├─────────────────────────────────────────────┤
│  Popular Calculators                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │   SIP   │ │   EMI   │ │   PPF   │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │   FD    │ │ Lumpsum │ │   NPS   │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                             │
├─────────────────────────────────────────────┤
│  Footer: Made in India 🇮🇳 | © 2026        │
└─────────────────────────────────────────────┘
```

---

## Calculator Page Layout (Consistent Pattern)

Every calculator page follows this structure:

```
┌─────────────────────────────────────────────┐
│  ← Back    [Calculator Name]     [Share]    │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         INPUT SECTION               │   │
│  │  ┌─────────────────────────────┐    │   │
│  │  │ Monthly Investment          │    │   │
│  │  │ ₹ [    5,000    ] ←slider   │    │   │
│  │  └─────────────────────────────┘    │   │
│  │  ┌─────────────────────────────┐    │   │
│  │  │ Expected Return (p.a.)      │    │   │
│  │  │   [    12%     ] ←slider    │    │   │
│  │  └─────────────────────────────┘    │   │
│  │  ┌─────────────────────────────┐    │   │
│  │  │ Time Period                 │    │   │
│  │  │   [   10 years  ] ←slider   │    │   │
│  │  └─────────────────────────────┘    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         RESULT SECTION              │   │
│  │                                     │   │
│  │   Total Value     ₹11,61,695       │   │
│  │   ───────────────────────────────   │   │
│  │   Invested        ₹6,00,000        │   │
│  │   Est. Returns    ₹5,61,695        │   │
│  │                                     │   │
│  │   [====== PIE CHART ======]        │   │
│  │   ■ Invested  ■ Returns            │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │       YEAR-BY-YEAR BREAKDOWN        │   │
│  │  (Expandable/collapsible table)     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         HOW IT WORKS                │   │
│  │  (Educational content + formula)    │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Component Architecture

### Shared Components

```typescript
// components/calculator/CalculatorLayout.tsx
// Wraps every calculator with consistent header, footer, SEO

// components/calculator/InputSlider.tsx
// Slider + input combo with label and formatting
// Props: label, min, max, step, value, onChange, prefix (₹), suffix (%)

// components/calculator/ResultCard.tsx
// Displays primary result prominently
// Props: label, value, subItems[]

// components/calculator/DonutChart.tsx
// Donut chart showing invested vs returns (using Recharts 3.x PieChart)
// Props: invested, returns
// Note: Recharts 3.x uses `shape` prop instead of deprecated activeShape/inactiveShape

// components/calculator/BreakdownTable.tsx
// Year-by-year expandable table
// Props: data[], columns[]

// components/calculator/InfoSection.tsx
// "How it works" educational content
// Props: title, content (markdown), formula
```

### Utility Functions

```typescript
// lib/calculators/sip.ts
// lib/calculators/emi.ts
// lib/calculators/ppf.ts
// etc.

// lib/format.ts
// formatCurrency(num) → "₹1,23,456" (Indian numbering)
// formatPercent(num) → "12%"
// formatYears(num) → "10 years"
```

### Indian Number Formatting
```typescript
// IMPORTANT: Use Indian numbering system
// 1,00,000 (1 lakh) not 100,000
// 1,00,00,000 (1 crore) not 10,000,000

function formatIndianCurrency(num: number): string {
  const formatted = num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR'
  });
  return formatted;
}

// Usage in JSX - always wrap currency in font-mono class
// <span className="font-mono">₹11,61,695</span>
```

**Font pairing:**
- Labels/text: `font-sans` (Geist Sans)
- Currency/numbers: `font-mono` (Geist Mono)
```

---

## MVP Calculators - Detailed Specifications

### 1. SIP Calculator

**URL:** `/sip-calculator`
**Title:** "SIP Calculator - Calculate SIP Returns Online"
**Description:** "Calculate your SIP maturity amount with our free SIP calculator. See how your monthly investments grow over time."

**Inputs:**
| Field | Label | Min | Max | Default | Step |
|-------|-------|-----|-----|---------|------|
| monthlyInvestment | Monthly Investment | ₹500 | ₹1,00,000 | ₹5,000 | ₹500 |
| expectedReturn | Expected Return (p.a.) | 1% | 30% | 12% | 0.5% |
| timePeriod | Time Period | 1 year | 40 years | 10 years | 1 year |

**Formula:**
```
M = P × ({[1 + r]^n – 1} / r) × (1 + r)

Where:
M = Maturity amount
P = Monthly investment
r = Monthly rate of return (annual rate / 12 / 100)
n = Number of months (years × 12)
```

**Implementation:**
```typescript
function calculateSIP(
  monthlyInvestment: number,
  annualReturn: number,
  years: number
): { maturityAmount: number; totalInvested: number; totalReturns: number } {
  const monthlyRate = annualReturn / 12 / 100;
  const months = years * 12;

  const maturityAmount = monthlyInvestment *
    (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate));

  const totalInvested = monthlyInvestment * months;
  const totalReturns = maturityAmount - totalInvested;

  return {
    maturityAmount: Math.round(maturityAmount),
    totalInvested,
    totalReturns: Math.round(totalReturns)
  };
}
```

**Chart:** Donut chart showing Invested vs Returns

**Table:** Year-by-year breakdown showing:
- Year
- Amount Invested (cumulative)
- Interest Earned (cumulative)
- Total Value

---

### 2. EMI Calculator

**URL:** `/emi-calculator`
**Title:** "EMI Calculator - Calculate Home, Car & Personal Loan EMI"
**Description:** "Calculate your monthly EMI for home loan, car loan, or personal loan. See complete amortization schedule."

**Inputs:**
| Field | Label | Min | Max | Default | Step |
|-------|-------|-----|-----|---------|------|
| loanAmount | Loan Amount | ₹10,000 | ₹10,00,00,000 | ₹50,00,000 | ₹10,000 |
| interestRate | Interest Rate (p.a.) | 1% | 20% | 8.5% | 0.1% |
| loanTenure | Loan Tenure | 1 year | 30 years | 20 years | 1 year |

**Formula:**
```
EMI = [P × r × (1+r)^n] / [(1+r)^n – 1]

Where:
P = Principal loan amount
r = Monthly interest rate (annual rate / 12 / 100)
n = Loan tenure in months
```

**Implementation:**
```typescript
function calculateEMI(
  principal: number,
  annualRate: number,
  years: number
): { emi: number; totalPayment: number; totalInterest: number } {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;

  const emi = principal * monthlyRate *
    Math.pow(1 + monthlyRate, months) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest)
  };
}
```

**Chart:** Donut chart showing Principal vs Interest

**Table:** Amortization schedule:
- Month/Year
- EMI
- Principal Component
- Interest Component
- Outstanding Balance

---

### 3. PPF Calculator

**URL:** `/ppf-calculator`
**Title:** "PPF Calculator - Public Provident Fund Returns Calculator"
**Description:** "Calculate PPF maturity amount and interest earned. Understand PPF rules, lock-in period, and tax benefits."

**Special Rules:**
- Minimum investment: ₹500/year
- Maximum investment: ₹1,50,000/year
- Lock-in period: 15 years (can extend in 5-year blocks)
- Interest compounded annually
- Current interest rate: 7.1% (updated quarterly by govt)

**Inputs:**
| Field | Label | Min | Max | Default | Step |
|-------|-------|-----|-----|---------|------|
| yearlyInvestment | Yearly Investment | ₹500 | ₹1,50,000 | ₹1,50,000 | ₹500 |
| timePeriod | Time Period | 15 years | 50 years | 15 years | 5 years |
| interestRate | Interest Rate (p.a.) | 5% | 10% | 7.1% | 0.1% |

**Note:** Show info banner that interest rate is set by government and may change quarterly.

**Formula:**
```
PPF compounds annually at end of financial year.
For consistent monthly deposits, calculate as:

For each year:
  Balance = (Previous Balance + Yearly Deposit) × (1 + r)

Where r = annual interest rate / 100
```

**Implementation:**
```typescript
function calculatePPF(
  yearlyInvestment: number,
  years: number,
  annualRate: number
): { maturityAmount: number; totalInvested: number; totalInterest: number; yearlyBreakdown: Array<{year: number; invested: number; interest: number; balance: number}> } {
  const rate = annualRate / 100;
  let balance = 0;
  const breakdown = [];

  for (let year = 1; year <= years; year++) {
    const openingBalance = balance;
    balance = (balance + yearlyInvestment) * (1 + rate);
    const interestEarned = balance - openingBalance - yearlyInvestment;

    breakdown.push({
      year,
      invested: yearlyInvestment * year,
      interest: Math.round(balance - yearlyInvestment * year),
      balance: Math.round(balance)
    });
  }

  const totalInvested = yearlyInvestment * years;

  return {
    maturityAmount: Math.round(balance),
    totalInvested,
    totalInterest: Math.round(balance - totalInvested),
    yearlyBreakdown: breakdown
  };
}
```

---

### 4. FD Calculator

**URL:** `/fd-calculator`
**Title:** "FD Calculator - Fixed Deposit Maturity Calculator"
**Description:** "Calculate fixed deposit maturity amount and interest. Compare simple vs compound interest."

**Inputs:**
| Field | Label | Min | Max | Default | Step |
|-------|-------|-----|-----|---------|------|
| principal | Deposit Amount | ₹1,000 | ₹10,00,00,000 | ₹1,00,000 | ₹1,000 |
| interestRate | Interest Rate (p.a.) | 1% | 15% | 7% | 0.1% |
| tenure | Tenure | 7 days | 10 years | 1 year | varies |
| compoundingFrequency | Compounding | - | - | Quarterly | - |

**Compounding Options:**
- Monthly
- Quarterly (most common)
- Half-yearly
- Yearly

**Formula:**
```
A = P × (1 + r/n)^(n×t)

Where:
A = Maturity amount
P = Principal
r = Annual interest rate (as decimal)
n = Compounding frequency per year
t = Time in years
```

**Implementation:**
```typescript
function calculateFD(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  compoundingFrequency: 'monthly' | 'quarterly' | 'halfyearly' | 'yearly'
): { maturityAmount: number; totalInterest: number } {
  const frequencyMap = {
    monthly: 12,
    quarterly: 4,
    halfyearly: 2,
    yearly: 1
  };

  const n = frequencyMap[compoundingFrequency];
  const r = annualRate / 100;
  const t = tenureMonths / 12;

  const maturityAmount = principal * Math.pow(1 + r / n, n * t);

  return {
    maturityAmount: Math.round(maturityAmount),
    totalInterest: Math.round(maturityAmount - principal)
  };
}
```

---

### 5. Lumpsum Calculator

**URL:** `/lumpsum-calculator`
**Title:** "Lumpsum Calculator - One-time Investment Returns Calculator"
**Description:** "Calculate returns on one-time mutual fund investment. See how your lumpsum grows over time."

**Inputs:**
| Field | Label | Min | Max | Default | Step |
|-------|-------|-----|-----|---------|------|
| investment | Investment Amount | ₹1,000 | ₹10,00,00,000 | ₹1,00,000 | ₹1,000 |
| expectedReturn | Expected Return (p.a.) | 1% | 30% | 12% | 0.5% |
| timePeriod | Time Period | 1 year | 40 years | 10 years | 1 year |

**Formula:**
```
A = P × (1 + r)^t

Where:
A = Final amount
P = Initial investment
r = Annual return rate (as decimal)
t = Time in years
```

**Implementation:**
```typescript
function calculateLumpsum(
  investment: number,
  annualReturn: number,
  years: number
): { finalAmount: number; totalReturns: number; yearlyBreakdown: Array<{year: number; value: number}> } {
  const rate = annualReturn / 100;
  const finalAmount = investment * Math.pow(1 + rate, years);

  const breakdown = [];
  for (let year = 1; year <= years; year++) {
    breakdown.push({
      year,
      value: Math.round(investment * Math.pow(1 + rate, year))
    });
  }

  return {
    finalAmount: Math.round(finalAmount),
    totalReturns: Math.round(finalAmount - investment),
    yearlyBreakdown: breakdown
  };
}
```

---

### 6. NPS Calculator

**URL:** `/nps-calculator`
**Title:** "NPS Calculator - National Pension System Returns Calculator"
**Description:** "Calculate NPS maturity corpus and monthly pension. Understand NPS tax benefits under 80CCD."

**Special Rules:**
- Minimum age: 18 years
- Maximum age at joining: 65 years (extended from 60)
- Maturity age: 60 years
- At maturity: 60% can be withdrawn (tax-free), 40% must buy annuity
- Annuity rates: ~6% currently (varies by provider)

**Inputs:**
| Field | Label | Min | Max | Default | Step |
|-------|-------|-----|-----|---------|------|
| currentAge | Current Age | 18 | 60 | 30 | 1 |
| monthlyInvestment | Monthly Investment | ₹500 | ₹1,00,000 | ₹5,000 | ₹500 |
| expectedReturn | Expected Return (p.a.) | 8% | 14% | 10% | 0.5% |
| annuityRate | Expected Annuity Rate | 4% | 8% | 6% | 0.5% |

**Outputs:**
- Total Corpus at 60
- Lumpsum Withdrawal (60%)
- Annuity Investment (40%)
- Expected Monthly Pension

**Implementation:**
```typescript
function calculateNPS(
  currentAge: number,
  monthlyInvestment: number,
  expectedReturn: number,
  annuityRate: number
): {
  totalCorpus: number;
  lumpsumWithdrawal: number;
  annuityInvestment: number;
  monthlyPension: number;
  totalInvested: number;
  yearsToRetirement: number;
} {
  const retirementAge = 60;
  const years = retirementAge - currentAge;
  const months = years * 12;
  const monthlyRate = expectedReturn / 12 / 100;

  // Calculate corpus using SIP formula
  const totalCorpus = monthlyInvestment *
    (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate));

  const lumpsumWithdrawal = totalCorpus * 0.6;
  const annuityInvestment = totalCorpus * 0.4;
  const monthlyPension = (annuityInvestment * (annuityRate / 100)) / 12;

  return {
    totalCorpus: Math.round(totalCorpus),
    lumpsumWithdrawal: Math.round(lumpsumWithdrawal),
    annuityInvestment: Math.round(annuityInvestment),
    monthlyPension: Math.round(monthlyPension),
    totalInvested: monthlyInvestment * months,
    yearsToRetirement: years
  };
}
```

---

## SEO Requirements

### Each Calculator Page Must Have:

1. **Title tag:** `{Calculator Name} - DhanKit`
2. **Meta description:** Unique, keyword-rich, ~155 characters
3. **H1:** Calculator name
4. **Structured data:** FAQPage schema for common questions
5. **Internal links:** Link to related calculators

### Homepage SEO:
```
Title: DhanKit - Free Financial Calculators for India
Description: Free SIP, EMI, PPF, FD, and NPS calculators. Make smarter financial decisions with beautiful visualizations and accurate calculations.
```

---

## Performance Requirements

- **Lighthouse score:** 90+ on all metrics
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **No layout shift** on calculation
- **Works offline:** Consider PWA for future

### Browser Support (Tailwind v4 requirement)
- Safari 16.4+
- Chrome 111+
- Firefox 128+

This covers 95%+ of Indian users. Older browsers will get unstyled fallbacks.

---

## Accessibility Requirements

- All inputs have associated labels
- Color contrast meets WCAG AA
- Keyboard navigable
- Screen reader friendly result announcements
- Touch targets minimum 44x44px on mobile

---

## Future Enhancements (Not MVP)

1. **Save/Share calculations** - URL params for sharing results
2. **Comparison mode** - Compare SIP vs Lumpsum
3. **PDF export** - Download calculation breakdown
4. **Dark mode** - Toggle theme
5. **More calculators** - SWP, ELSS, HRA, Gratuity
6. **Goal-based calculators** - "I want ₹1Cr in 10 years"
7. **Inflation adjustment** - Real vs nominal returns
8. **Blog section** - SEO content about personal finance

---

## File Structure

```
dhankit/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Homepage
│   ├── about/
│   │   └── page.tsx
│   ├── sip-calculator/
│   │   └── page.tsx
│   ├── emi-calculator/
│   │   └── page.tsx
│   ├── ppf-calculator/
│   │   └── page.tsx
│   ├── fd-calculator/
│   │   └── page.tsx
│   ├── lumpsum-calculator/
│   │   └── page.tsx
│   └── nps-calculator/
│       └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── CalculatorCard.tsx      # Homepage grid item
│   ├── calculator/
│   │   ├── CalculatorLayout.tsx
│   │   ├── InputSlider.tsx
│   │   ├── ResultCard.tsx
│   │   ├── DonutChart.tsx
│   │   ├── BreakdownTable.tsx
│   │   └── InfoSection.tsx
│   └── ui/                         # shadcn components
├── lib/
│   ├── calculators/
│   │   ├── sip.ts
│   │   ├── emi.ts
│   │   ├── ppf.ts
│   │   ├── fd.ts
│   │   ├── lumpsum.ts
│   │   └── nps.ts
│   ├── format.ts                   # Indian currency formatting
│   └── utils.ts
├── public/
│   ├── favicon.ico
│   └── og-image.png                # Social share image
└── styles/
    └── globals.css
```

---

## Launch Checklist

- [ ] All 6 calculators working correctly
- [ ] Mobile responsive on all pages
- [ ] Indian number formatting throughout
- [ ] Charts rendering correctly
- [ ] SEO meta tags on all pages
- [ ] Favicon and OG image
- [ ] 404 page
- [ ] Analytics setup (Plausible or Umami preferred)
- [ ] Domain connected to Vercel
- [ ] SSL working
- [ ] Test on real devices (Android + iOS)

---

## Success Metrics

- Organic search traffic growth
- Time on site > 2 minutes
- Calculator completion rate
- Return visitor rate
- Page load time < 2s

---

## Version Reference

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16.1.x | Turbopack stable, `use cache` directive |
| Tailwind CSS | 4.1.x | CSS-based config, 5x faster builds |
| shadcn/ui | latest | Auto-detects Next.js 16 + Tailwind v4 |
| Recharts | 3.6.x | Rewritten internals, no external deps |
| React | 19.x | Included with Next.js 16 |

---

*Document created: January 2026*
*Last updated: January 16, 2026*
