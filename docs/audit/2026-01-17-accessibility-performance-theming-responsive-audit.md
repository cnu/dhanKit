# dhanKit Comprehensive Audit Report

**Date:** 2026-01-17
**Auditor:** Claude Code (Opus 4.5)
**Scope:** Full codebase audit - Accessibility, Performance, Theming, Responsive Design, Anti-Patterns

---

## Anti-Patterns Verdict

**PASS** - This codebase does NOT look AI-generated. Here's the assessment against common AI slop tells:

| AI Slop Tell | Present? | Notes |
|--------------|----------|-------|
| Purple gradients on white | No | Uses emerald (#10B981) primary - intentional "money/growth" semantic |
| Gradient text | No | Text uses solid semantic colors |
| Glassmorphism | No | Clean card borders, no backdrop-blur abuse |
| Hero metrics dashboard | No | Calculators are functional tools, not vanity dashboards |
| Generic card grid | Borderline | Homepage has a card grid, but it's contextually appropriate for calculator listing |
| Generic fonts (Inter, Roboto) | No | Uses **Geist Sans/Mono** - distinctive, technical fonts |
| Excessive animations | No | Restrained motion - only subtle hover effects |
| Gray text on colored background | Minor | `text-muted-foreground` on `bg-primary/5` could be checked |
| Nested cards | No | Clean single-level card hierarchy |
| Bounce easing | No | Uses standard easing |
| Redundant copy | No | Copy is functional and concise |

**Verdict**: The design is **utilitarian and functional** - appropriate for a financial calculator tool targeting Indian investors. It's clean rather than flashy, which is suitable for the trust-focused finance domain. The color choices (emerald for growth, indigo for trust) show intentional semantic reasoning.

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | **4** |
| High | **8** |
| Medium | **12** |
| Low | **7** |
| **Total** | **31** |

### Most Critical Issues

1. **Slider components lack ARIA labels** - Screen readers cannot announce slider values (WCAG 1.3.1, 4.1.2)
2. **Touch targets below 44x44px** - Switch (18.4px), slider thumb (16px), buttons (36px) violate WCAG 2.5.5
3. **DonutChart hard-coded colors** - Tooltip breaks in dark mode (white bg on dark)
4. **Recharts 200KB bundle** - Massive overhead for a single pie chart
5. **No URL update debouncing** - Every slider tick triggers `router.replace()`

### Overall Quality Score

| Category | Score | Notes |
|----------|-------|-------|
| Accessibility | **65/100** | Radix foundations good, but ARIA gaps and touch targets need work |
| Performance | **70/100** | Good memoization patterns, but Recharts bundle is heavy |
| Theming | **75/100** | Solid design system, some hard-coded colors in charts |
| Responsive | **72/100** | Mobile-first approach, but touch targets need attention |
| Design Quality | **82/100** | Clean, purposeful, avoids AI slop |

---

## Detailed Findings by Severity

### Critical Issues

#### 1. Slider ARIA Labels Missing
- **Location**: `components/ui/slider.tsx:48-58`
- **Severity**: Critical
- **Category**: Accessibility
- **Description**: Slider components lack `aria-label`, `aria-labelledby`, and `aria-valuetext` attributes
- **Impact**: Screen reader users cannot understand what the slider controls or its current value
- **WCAG**: 1.3.1 (Info and Relationships), 4.1.2 (Name, Role, Value)
- **Recommendation**: Add `aria-label={label}` prop and format `aria-valuetext` with currency/percentage
- **Suggested command**: `/harden`

#### 2. DonutChart Tooltip Dark Mode Breakage
- **Location**: `components/calculator/DonutChart.tsx:52-55`
- **Severity**: Critical
- **Category**: Theming
- **Description**: Tooltip uses hard-coded `backgroundColor: "#ffffff"` and `border: "1px solid #e5e7eb"`
- **Impact**: In dark mode, tooltip appears as white box on dark background - nearly invisible
- **Recommendation**: Compute CSS variable values at runtime for Recharts inline styles
- **Suggested command**: `/normalize`

#### 3. Switch Touch Target Too Small
- **Location**: `components/ui/switch.tsx:16`
- **Severity**: Critical
- **Category**: Responsive/Accessibility
- **Description**: Switch is 18.4px tall x 32px wide (`h-[1.15rem] w-8`)
- **Impact**: Mobile users (70%+ of traffic per CLAUDE.md) will misclick toggles
- **WCAG**: 2.5.5 Target Size (Enhanced)
- **Recommendation**: Wrap in padding container or increase base size to reach 44x44px hit area
- **Suggested command**: `/harden`

#### 4. No Suspense Boundaries for Calculator Client Components
- **Location**: All 9 calculator `page.tsx` files
- **Severity**: Critical
- **Category**: Performance
- **Description**: Client components render without `<Suspense>` fallback
- **Impact**: On slow 3G/4G (mobile-heavy traffic), users see blank screen during hydration
- **Recommendation**: Add `<Suspense fallback={<LoadingSkeleton />}>` wrapper
- **Suggested command**: `/optimize`

---

### High-Severity Issues

#### 5. Recharts Bundle Size (200KB+)
- **Location**: `components/calculator/DonutChart.tsx`
- **Severity**: High
- **Category**: Performance
- **Description**: Full Recharts library loaded for single `PieChart` component
- **Impact**: 1-2 second additional load time on 3G; affects 70% mobile users
- **Recommendation**: Replace with lighter SVG-based chart (Visx) or lazy-load
- **Suggested command**: `/optimize`

#### 6. No URL Update Debouncing
- **Location**: All 9 calculator components (e.g., `SIPCalculator.tsx:90-121`)
- **Severity**: High
- **Category**: Performance
- **Description**: `router.replace()` called on every input change (7-10 dependencies)
- **Impact**: Visible lag on rapid slider adjustment; network overhead
- **Recommendation**: Debounce with 300-500ms delay using `setTimeout`
- **Suggested command**: `/optimize`

#### 7. DonutChart Missing React.memo
- **Location**: `components/calculator/DonutChart.tsx:19`
- **Severity**: High
- **Category**: Performance
- **Description**: Chart re-renders on every parent state change
- **Impact**: Recharts SVG re-render on each slider tick causes stuttering
- **Recommendation**: Wrap export with `React.memo()`
- **Suggested command**: `/optimize`

#### 8. Hard-Coded Recharts Colors
- **Location**: `components/calculator/DonutChart.tsx:14-17`
- **Severity**: High
- **Category**: Theming
- **Description**: `COLORS = { invested: "#10B981", returns: "#6366F1" }` are hex literals
- **Impact**: Colors don't respect theme changes
- **Recommendation**: Use CSS variable references or compute from `getComputedStyle`
- **Suggested command**: `/normalize`

#### 9. Missing Skip Links
- **Location**: `app/layout.tsx`, `components/layout/Header.tsx`
- **Severity**: High
- **Category**: Accessibility
- **Description**: No "Skip to main content" link for keyboard users
- **Impact**: Keyboard users must tab through header on every page
- **WCAG**: 2.4.1 (Bypass Blocks)
- **Recommendation**: Add visually-hidden skip link at top of page
- **Suggested command**: `/harden`

#### 10. Slider Thumb Touch Target
- **Location**: `components/ui/slider.tsx:56`
- **Severity**: High
- **Category**: Responsive
- **Description**: Thumb is `size-4` (16px), below 44px minimum
- **Impact**: Precise touch required on mobile; accessibility issue
- **Recommendation**: Increase to `size-6` or ensure Radix hit area expansion is working
- **Suggested command**: `/harden`

#### 11. Button Default Size Below Target
- **Location**: `components/ui/button.tsx:24-26`
- **Severity**: High
- **Category**: Responsive
- **Description**: Default button `h-9` (36px), `sm` variant `h-8` (32px)
- **Impact**: CTA buttons throughout app are below 44px touch target
- **Recommendation**: Use `lg` variant by default on mobile
- **Suggested command**: `/harden`

#### 12. Table Horizontal Scroll UX
- **Location**: `components/calculator/BreakdownTable.tsx:33-34`
- **Severity**: High
- **Category**: Responsive
- **Description**: 5-column tables overflow on phones <640px
- **Impact**: Mobile users must horizontal scroll to see amortization data
- **Recommendation**: Stack table vertically on mobile or add scroll indicator
- **Suggested command**: `/harden`

---

### Medium-Severity Issues

#### 13. Primary Color Contrast Borderline
- **Location**: `app/globals.css:8`
- **Severity**: Medium
- **Category**: Accessibility
- **Description**: `#10B981` (primary) on `#FAFAFA` (background) is ~4.3:1 ratio
- **Impact**: Borderline WCAG AA (4.5:1 required for normal text)
- **WCAG**: 1.4.3 (Contrast Minimum)
- **Recommendation**: Verify usage context; use darker `primary-dark` for critical text
- **Suggested command**: `/audit` (manual verification)

#### 14. PPF Calculator Blue Color System
- **Location**: `app/ppf-calculator/PPFCalculator.tsx:156-159`
- **Severity**: Medium
- **Category**: Theming
- **Description**: Uses `blue-200`, `blue-600`, etc. instead of design tokens
- **Impact**: Inconsistent with emerald/indigo design system
- **Recommendation**: Replace with `primary/20`, `primary` token references
- **Suggested command**: `/normalize`

#### 15. OG Image Hard-Coded Colors (9 files)
- **Location**: `app/api/og/*/route.tsx`
- **Severity**: Medium
- **Category**: Theming
- **Description**: Hex colors scattered throughout OG generation routes
- **Impact**: Code maintenance issue; inconsistent if theme changes
- **Recommendation**: Create shared `COLORS` constant object
- **Suggested command**: `/normalize`

#### 16. OG Image Font Fetch on Every Request
- **Location**: `app/api/og/*/route.tsx`
- **Severity**: Medium
- **Category**: Performance
- **Description**: Noto Sans font fetched from Google on every OG generation
- **Impact**: 100-500ms latency on each shared link preview
- **Recommendation**: Cache font at Edge or inline base64
- **Suggested command**: `/optimize`

#### 17. Missing aria-describedby on Switches
- **Location**: All calculator files with toggle switches
- **Severity**: Medium
- **Category**: Accessibility
- **Description**: Switch descriptions not programmatically associated
- **Impact**: Screen readers announce switch but not its description
- **WCAG**: 1.3.1 (Info and Relationships)
- **Suggested command**: `/harden`

#### 18. Heading Hierarchy in Calculators
- **Location**: Calculator info sections
- **Severity**: Medium
- **Category**: Accessibility
- **Description**: Multiple `h2` elements without proper section wrapping
- **Impact**: Screen reader navigation less predictable
- **WCAG**: 1.3.1 (Info and Relationships)
- **Suggested command**: `/harden`

#### 19. ResultCard Text Size Not Responsive
- **Location**: `components/calculator/ResultCard.tsx:47`
- **Severity**: Medium
- **Category**: Responsive
- **Description**: Main value always `text-3xl` (30px)
- **Impact**: May overflow on ultra-narrow screens
- **Recommendation**: Use `text-2xl sm:text-3xl`
- **Suggested command**: `/harden`

#### 20. Logo Not Responsive
- **Location**: `components/layout/Header.tsx:15`
- **Severity**: Medium
- **Category**: Responsive
- **Description**: Logo fixed at `h-10` (40px) all breakpoints
- **Impact**: Takes proportionally more space on mobile
- **Recommendation**: Use `h-8 sm:h-9 md:h-10`
- **Suggested command**: `/harden`

#### 21. DonutChart Height Fixed
- **Location**: `components/calculator/DonutChart.tsx:31`
- **Severity**: Medium
- **Category**: Responsive
- **Description**: Chart always `h-64` (256px)
- **Impact**: Takes 38% of viewport on iPhone SE
- **Recommendation**: Use `h-48 sm:h-56 md:h-64`
- **Suggested command**: `/harden`

#### 22. Inline SWPBreakdownTable Component
- **Location**: `app/swp-calculator/SWPCalculator.tsx:49-133`
- **Severity**: Medium
- **Category**: Performance
- **Description**: Component defined inline, recreated each render
- **Impact**: Prevents React.memo optimization
- **Recommendation**: Extract to separate file
- **Suggested command**: `/optimize`

#### 23. Max-Width Inconsistency
- **Location**: Various layout files
- **Severity**: Medium
- **Category**: Responsive
- **Description**: Homepage uses `max-w-5xl`, calculators use `max-w-4xl`/`max-w-3xl`
- **Impact**: Visual discontinuity when navigating
- **Recommendation**: Standardize on `max-w-4xl` or `max-w-5xl`
- **Suggested command**: `/normalize`

#### 24. Color-Only Chart Differentiation
- **Location**: `components/calculator/DonutChart.tsx`
- **Severity**: Medium
- **Category**: Accessibility
- **Description**: Donut chart segments differentiated only by color
- **Impact**: Color-blind users may struggle to distinguish segments
- **WCAG**: 1.4.1 (Use of Color)
- **Recommendation**: Add patterns or labels
- **Suggested command**: `/harden`

---

### Low-Severity Issues

#### 25. Oversized Logo Asset
- **Location**: `public/logo.png` (20KB, 887x338)
- **Severity**: Low
- **Category**: Performance
- **Description**: Large PNG downscaled to 40px display height
- **Recommendation**: Create SVG or optimized smaller PNG
- **Suggested command**: `/optimize`

#### 26. Slider Thumb Hard-Coded White
- **Location**: `components/ui/slider.tsx:56`
- **Severity**: Low
- **Category**: Theming
- **Description**: Thumb uses `bg-white` regardless of theme
- **Recommendation**: Use `bg-background`
- **Suggested command**: `/normalize`

#### 27. BreakdownTable Key Fallback to Index
- **Location**: `components/calculator/BreakdownTable.tsx:51`
- **Severity**: Low
- **Category**: Performance
- **Description**: Falls back to array index when `periodKey` undefined
- **Impact**: Potential DOM reconciliation issues
- **Recommendation**: Use composite key
- **Suggested command**: `/optimize`

#### 28. Share Button DOM Manipulation Fallback
- **Location**: All calculator components
- **Severity**: Low
- **Category**: Performance
- **Description**: Creates/removes textarea for clipboard fallback
- **Impact**: Deprecated `execCommand`; unnecessary reflows
- **Recommendation**: Remove fallback; modern browsers support `navigator.clipboard`
- **Suggested command**: `/optimize`

#### 29. Prose Text Overflow
- **Location**: All calculator info sections
- **Severity**: Low
- **Category**: Responsive
- **Description**: Long formulas in code blocks may overflow
- **Recommendation**: Add `overflow-x-auto` to code blocks
- **Suggested command**: `/harden`

#### 30. RelatedCalculators Text Truncation
- **Location**: `components/calculator/RelatedCalculators.tsx:24-28`
- **Severity**: Low
- **Category**: Responsive
- **Description**: `truncate` cuts off long titles on mobile
- **Impact**: Less informative card titles
- **Recommendation**: Use `line-clamp-2` or allow wrap on mobile
- **Suggested command**: `/harden`

#### 31. No Focus Management on Table Expand
- **Location**: `components/calculator/BreakdownTable.tsx`
- **Severity**: Low
- **Category**: Accessibility
- **Description**: Focus not managed when toggling "Show More"
- **Impact**: Screen reader users may lose context
- **Recommendation**: Move focus to newly revealed content
- **Suggested command**: `/harden`

---

## Patterns & Systemic Issues

### Recurring Problems

1. **Touch targets consistently below 44px** - Switch, slider thumb, buttons all need padding wrappers or size increases. This is a systemic issue affecting mobile UX.

2. **Hard-coded colors in Recharts integration** - The charting library doesn't support CSS variables in inline styles. Need a consistent pattern for theme-aware charts.

3. **URL state sync on every input change** - All 9 calculators follow the same pattern of `router.replace()` in useEffect without debouncing.

4. **Missing Suspense boundaries** - No calculator has loading state for slow network hydration.

5. **OG image routes share same anti-patterns** - Font fetching and hard-coded colors repeated 9 times.

---

## Positive Findings

### What's Working Well

1. **Proper useMemo/useCallback discipline** - Calculations are correctly memoized with tight dependency arrays
2. **Geist font choice** - Distinctive, technical fonts avoid generic AI look
3. **Clean design system** - CSS variables well-organized in globals.css with semantic naming
4. **Tailwind v4 modern config** - Uses CSS-based configuration properly
5. **Indian currency formatting** - Correct implementation of lakh/crore formatting
6. **URL-based state** - Enables shareable calculations; good UX pattern
7. **Mobile-first responsive grids** - Proper breakpoint usage throughout
8. **Radix UI primitives** - Solid accessibility foundation from component library
9. **Dynamic OG metadata** - SEO-friendly server-side metadata generation
10. **No AI slop aesthetics** - Purposeful, functional design appropriate for finance domain

---

## Recommendations by Priority

### 1. Immediate (Critical blockers)
- [ ] Add ARIA labels to all slider components
- [ ] Fix DonutChart tooltip for dark mode
- [ ] Increase touch targets: switch, slider thumb, buttons
- [ ] Add Suspense boundaries to calculator pages

### 2. Short-term (This sprint)
- [ ] Debounce URL updates (300-500ms)
- [ ] Add React.memo to DonutChart
- [ ] Add skip link to header
- [ ] Extract Recharts colors to theme-aware pattern
- [ ] Create responsive table pattern for mobile

### 3. Medium-term (Next sprint)
- [ ] Evaluate Recharts replacement (Visx, custom SVG)
- [ ] Standardize max-width across pages
- [ ] Add `aria-describedby` to switch toggles
- [ ] Make ResultCard/DonutChart heights responsive
- [ ] Centralize OG image color constants

### 4. Long-term (Backlog)
- [ ] Optimize logo asset (SVG)
- [ ] Cache OG image fonts at Edge
- [ ] Extract SWPBreakdownTable to separate file
- [ ] Add focus management to expandable tables
- [ ] Remove deprecated share fallback

---

## Suggested Commands for Fixes

| Command | Issues Addressed | Count |
|---------|------------------|-------|
| `/harden` | Touch targets, ARIA, skip links, responsive hardening | **14** |
| `/normalize` | Theming consistency, design tokens, max-widths | **6** |
| `/optimize` | Performance: debouncing, memoization, bundle size, Suspense | **9** |
| Manual/Other | Contrast verification, Recharts replacement evaluation | **2** |

---

## Appendix: Files Requiring Updates

### High Priority
1. `components/ui/slider.tsx` - ARIA labels, thumb size
2. `components/ui/switch.tsx` - Touch target size
3. `components/calculator/DonutChart.tsx` - Memoization, dark mode tooltip, colors
4. `components/ui/button.tsx` - Touch target sizes
5. `components/calculator/BreakdownTable.tsx` - Mobile table pattern, keys

### Medium Priority
6. `components/layout/Header.tsx` - Skip link, responsive logo
7. `components/calculator/ResultCard.tsx` - Responsive text size
8. `app/ppf-calculator/PPFCalculator.tsx` - Blue color tokens
9. All 9 calculator page.tsx files - Suspense boundaries
10. All 9 calculator components - URL debouncing

### Lower Priority
11. `app/api/og/*/route.tsx` (9 files) - Color constants, font caching
12. `app/swp-calculator/SWPCalculator.tsx` - Extract inline component
13. `public/logo.png` - Asset optimization
