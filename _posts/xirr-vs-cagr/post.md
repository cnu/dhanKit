---
title: "XIRR vs CAGR: Which Should You Use for SIP Returns?"
description: "Understand the difference between XIRR and CAGR for measuring investment returns. Learn when to use each metric and how they apply to SIP, lumpsum, and mixed investments."
calculators:
  - cagr-calculator
  - sip-calculator
icon: "📊"
---

Your mutual fund shows 12% CAGR, but your actual SIP returns are 15% XIRR. Which is the real return? Both are correct—they just measure different things.

Understanding XIRR vs CAGR is essential for accurately evaluating your investment performance.

## The Fundamental Difference

### CAGR (Compound Annual Growth Rate)

| Aspect | Details |
|--------|---------|
| Measures | Growth rate of a single lumpsum investment |
| Assumes | One-time investment at start |
| Best for | Lumpsum investments, fund performance |
| Formula | (Ending Value / Starting Value)^(1/n) - 1 |

### XIRR (Extended Internal Rate of Return)

| Aspect | Details |
|--------|---------|
| Measures | Returns on multiple investments at different times |
| Accounts for | Different investment dates and amounts |
| Best for | SIP, irregular investments, portfolio returns |
| Calculation | Iterative (needs dates and amounts) |

**Calculate your returns:** Use our [CAGR Calculator](/cagr-calculator) and [SIP Calculator](/sip-calculator).

## Simple Example

### Same Fund, Different Investors

**Fund grows from ₹100 to ₹150 in 3 years**

**Investor A: Lumpsum**
- Invested: ₹1,00,000 on Jan 1, 2021
- Value: ₹1,50,000 on Jan 1, 2024
- **CAGR: 14.47%**
- **XIRR: 14.47%** (same for lumpsum)

**Investor B: SIP**
- Invested: ₹2,778/month for 36 months = ₹1,00,000
- Value: ₹1,35,000 on Jan 1, 2024
- **CAGR: Not applicable** (multiple investments)
- **XIRR: 18.5%**

**Key insight:** SIP investor's XIRR is higher because more money was invested when markets were lower.

## When to Use CAGR

### Appropriate Scenarios

| Scenario | Why CAGR Works |
|----------|----------------|
| Lumpsum investment | Single investment point |
| Fund performance comparison | Standard benchmark |
| Index returns | Shows market growth |
| FD/PPF returns | Single investment, known tenure |

### CAGR Calculation

**Formula:** CAGR = (Final Value / Initial Value)^(1/Years) - 1

**Example:**
- Initial: ₹10,00,000
- Final (after 5 years): ₹17,62,342
- CAGR = (17,62,342 / 10,00,000)^(1/5) - 1 = 12%

### CAGR Limitations

| Limitation | Explanation |
|------------|-------------|
| Ignores cash flows | Doesn't account for additions/withdrawals |
| Assumes single investment | Not suitable for SIP |
| Timing blind | Same result regardless of when growth occurred |

## When to Use XIRR

### Appropriate Scenarios

| Scenario | Why XIRR Works |
|----------|----------------|
| SIP investments | Multiple investments at different times |
| Irregular investments | Varying amounts and dates |
| Portfolio with additions | Additional lumpsum investments |
| Dividend reinvestment | Multiple cash flows |
| SWP analysis | Outflows at different times |

### XIRR Calculation

XIRR requires:
1. List of all cash flows (investments as negative, redemptions as positive)
2. Dates of each cash flow
3. Current value (as final positive cash flow)

**Example: SIP of ₹10,000/month for 2 years**

| Date | Cash Flow |
|------|-----------|
| Jan 2022 | -₹10,000 |
| Feb 2022 | -₹10,000 |
| ... | ... |
| Dec 2023 | -₹10,000 |
| Dec 2023 | +₹2,65,000 (current value) |

XIRR = 12.8% (calculated iteratively)

### XIRR in Excel/Google Sheets

```
=XIRR(cash_flow_range, date_range)
```

| Column A (Date) | Column B (Cash Flow) |
|-----------------|---------------------|
| 01/01/2022 | -10000 |
| 01/02/2022 | -10000 |
| ... | ... |
| 01/01/2024 | 265000 |

Formula: `=XIRR(B1:B25, A1:A25)`

## Why They Give Different Results

### Case Study: Rising Market

**₹10,000/month SIP for 3 years, market rises steadily**

| Year | Average NAV | Units Bought |
|------|-------------|--------------|
| Year 1 | ₹100 | 1,200 |
| Year 2 | ₹120 | 1,000 |
| Year 3 | ₹140 | 857 |
| **Total** | | **3,057 units** |

- Total invested: ₹3,60,000
- Final value (NAV ₹150): ₹4,58,550
- **CAGR of fund:** 14.5% (100 to 150)
- **Your XIRR:** 11.2%

**You underperformed fund CAGR** because you bought more units at higher prices.

### Case Study: Falling Then Rising Market

**₹10,000/month SIP for 3 years, market falls then recovers**

| Year | Average NAV | Units Bought |
|------|-------------|--------------|
| Year 1 | ₹100 | 1,200 |
| Year 2 | ₹70 | 1,714 |
| Year 3 | ₹85 | 1,412 |
| **Total** | | **4,326 units** |

- Total invested: ₹3,60,000
- Final value (NAV ₹100): ₹4,32,600
- **CAGR of fund:** 0% (100 to 100)
- **Your XIRR:** 12.5%

**You outperformed fund CAGR** because you bought more units when prices were low.

## Comparing Fund Performance

### What Funds Report

| Metric | What It Shows | Investor Relevance |
|--------|---------------|-------------------|
| 1-year return | CAGR over 1 year | Lumpsum investor |
| 3-year return | CAGR over 3 years | Lumpsum investor |
| 5-year return | CAGR over 5 years | Lumpsum investor |
| SIP return | Sometimes XIRR | SIP investor |

### Comparing Your Returns to Fund Returns

| Your Investment | Compare To |
|-----------------|------------|
| Lumpsum | Fund's CAGR |
| SIP | Fund's SIP return (XIRR) or calculate your XIRR |
| Mixed | Your portfolio XIRR |

## Common Misconceptions

### Misconception 1: "My SIP XIRR Should Equal Fund CAGR"

**Reality:** They measure different things. SIP XIRR depends on:
- When you invested (market timing)
- Market volatility during your SIP
- Whether markets rose or fell during SIP

### Misconception 2: "Higher XIRR Always Means Better Performance"

**Reality:** XIRR depends on timing. A lower XIRR from steady SIP might be better than higher XIRR from lucky timing.

### Misconception 3: "CAGR is the 'Real' Return"

**Reality:** For SIP investors, XIRR is the real return. CAGR is only relevant for lumpsum.

## Practical Applications

### Evaluating Your SIP

| Step | Action |
|------|--------|
| 1 | List all SIP dates and amounts |
| 2 | Add current value as final positive flow |
| 3 | Calculate XIRR |
| 4 | Compare to fund's SIP return |

### Evaluating Your Portfolio

| Step | Action |
|------|--------|
| 1 | List ALL cash flows (SIP, lumpsum, switches) |
| 2 | Include all dates |
| 3 | Add total current value |
| 4 | Calculate portfolio XIRR |

### Setting Return Expectations

| Investment Type | Benchmark | Why |
|-----------------|-----------|-----|
| SIP in equity fund | 12-14% XIRR | Long-term SIP return |
| Lumpsum in equity | 12-14% CAGR | Fund return benchmark |
| Debt fund SIP | 7-9% XIRR | Debt fund returns |
| Mixed portfolio | 9-12% XIRR | Weighted average |

## XIRR vs CAGR: Summary

| Factor | CAGR | XIRR |
|--------|------|------|
| Best for | Lumpsum | SIP/multiple investments |
| Considers timing | No | Yes |
| Considers amounts | No | Yes |
| Easy to calculate | Yes | Needs software |
| Fund comparison | Standard | Personal return |
| Formula | Simple | Iterative |

## Tools for Calculation

### For CAGR

**Use our [CAGR Calculator](/cagr-calculator)** or:
- Excel: `=(Ending/Starting)^(1/Years)-1`
- Manual: Standard CAGR formula

### For XIRR

**Use our [SIP Calculator](/sip-calculator)** or:
- Excel: `=XIRR(cash_flows, dates)`
- Google Sheets: `=XIRR(cash_flows, dates)`
- Online XIRR calculators

## Conclusion

| Question | Use |
|----------|-----|
| What's the fund's performance? | CAGR |
| What's my lumpsum return? | CAGR |
| What's my SIP return? | XIRR |
| What's my portfolio return? | XIRR |
| Comparing funds | CAGR (standard benchmark) |
| Evaluating my investment decisions | XIRR |

**Key takeaways:**
1. CAGR is for lumpsum, XIRR is for SIP/multiple investments
2. Fund returns are shown as CAGR—your SIP return will differ
3. SIP XIRR can be higher or lower than fund CAGR
4. Use XIRR to track your actual portfolio performance
5. Don't compare your SIP XIRR directly to fund CAGR

Understanding this distinction helps you set realistic expectations and accurately evaluate your investment performance.

---

*Calculate your returns:* Use our [CAGR Calculator](/cagr-calculator) for lumpsum and [SIP Calculator](/sip-calculator) for SIP returns.
