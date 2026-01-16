---
title: "How to Calculate SIP Returns: A Step-by-Step Guide"
description: "Learn the exact formulas and methods to calculate SIP returns including absolute returns, CAGR, and XIRR. Understand which metric to use for your SIP investments."
calculators:
  - sip-calculator
icon: "🧮"
---

You've been investing in SIP for years. But when someone asks "What returns did you get?", do you know how to calculate it correctly?

SIP return calculation is trickier than lumpsum because money goes in at different times. Let's master all the methods.

## Why SIP Returns Are Different

**Lumpsum:** One investment, one duration, simple calculation.

**SIP:** Multiple investments at different NAVs, each with different holding period.

| Month | SIP Amount | NAV | Units | Holding Period |
|-------|------------|-----|-------|----------------|
| Jan | ₹10,000 | 100 | 100 | 12 months |
| Feb | ₹10,000 | 95 | 105.26 | 11 months |
| Mar | ₹10,000 | 105 | 95.24 | 10 months |
| ... | ... | ... | ... | ... |
| Dec | ₹10,000 | 110 | 90.91 | 1 month |

Each installment has a different return. How do you calculate the overall return?

**Calculate your SIP returns:** Use our [SIP Calculator](/sip-calculator) to get accurate projections.

## Method 1: Absolute Returns (Simple but Misleading)

### Formula
```
Absolute Return = ((Current Value - Total Investment) / Total Investment) × 100
```

### Example
- Total invested: ₹1,20,000 (₹10,000 × 12 months)
- Current value: ₹1,35,000
- Absolute return: ((1,35,000 - 1,20,000) / 1,20,000) × 100 = **12.5%**

### Problems with Absolute Returns

| Investment | Duration | Absolute Return | Looks Like |
|------------|----------|-----------------|------------|
| SIP A | 1 year | 12.5% | Great! |
| SIP B | 3 years | 12.5% | Same as A? |

Both show 12.5%, but SIP A is clearly better (same return in less time).

**Verdict:** Use absolute returns only for periods under 1 year.

## Method 2: CAGR (Better, but Still Imperfect)

### Formula
```
CAGR = ((Current Value / Total Investment)^(1/Years) - 1) × 100
```

### Example
- Total invested: ₹3,60,000 (₹10,000 × 36 months)
- Current value: ₹4,50,000
- Years: 3
- CAGR: ((4,50,000 / 3,60,000)^(1/3) - 1) × 100 = **7.72%**

### Problem with CAGR for SIP

CAGR assumes all money was invested on Day 1. But in SIP:
- First installment was invested for 36 months
- Last installment was invested for only 1 month

CAGR underestimates actual SIP returns.

| Actual Scenario | CAGR Assumption |
|-----------------|-----------------|
| ₹10K invested month 1 → 36 months | ₹3.6L invested month 1 → 36 months |
| ₹10K invested month 36 → 1 month | (nothing new) |

**Verdict:** CAGR is okay for rough estimates but not accurate for SIP.

## Method 3: XIRR (The Correct Method)

### What is XIRR?

XIRR (Extended Internal Rate of Return) accounts for:
- Different amounts invested at different times
- The actual duration each amount was invested
- Returns the annualized rate that equates all cash flows

### How XIRR Works

XIRR solves for 'r' in this equation:
```
0 = Σ (Cash Flow / (1 + r)^(days/365))
```

For SIP, cash flows are:
- Negative: Each SIP installment (money going out)
- Positive: Current value (money coming back)

### Example XIRR Calculation

| Date | Cash Flow | Type |
|------|-----------|------|
| 01-Jan-2023 | -₹10,000 | SIP |
| 01-Feb-2023 | -₹10,000 | SIP |
| 01-Mar-2023 | -₹10,000 | SIP |
| ... | ... | ... |
| 01-Dec-2023 | -₹10,000 | SIP |
| 31-Dec-2023 | +₹1,35,000 | Current value |

Using Excel/Google Sheets XIRR function:
```
=XIRR(cash_flows, dates)
```

**Result: 24.5% XIRR** (vs 12.5% absolute return)

Why so different? Because average holding period is only ~6 months, not 12 months.

### XIRR vs CAGR Comparison

| Metric | Value | What It Represents |
|--------|-------|-------------------|
| Absolute Return | 12.5% | Total gain (ignores time) |
| CAGR | 12.5% | Annualized (assumes lumpsum) |
| XIRR | 24.5% | True annualized SIP return |

**XIRR is always higher than CAGR for growing SIPs** because later installments have shorter holding periods.

## Calculating XIRR in Excel/Google Sheets

### Step 1: Set Up Data

| Column A (Date) | Column B (Amount) |
|-----------------|-------------------|
| 01-01-2023 | -10000 |
| 01-02-2023 | -10000 |
| 01-03-2023 | -10000 |
| ... | ... |
| 01-12-2023 | -10000 |
| 31-12-2023 | 135000 |

Note: SIP amounts are negative (outflow), final value is positive (inflow).

### Step 2: Apply XIRR Formula

```
=XIRR(B1:B13, A1:A13) × 100
```

Result: Your annualized SIP return.

### Step 3: Handle Ongoing SIPs

For active SIPs (not redeemed), use current date and current value:

| Date | Amount |
|------|--------|
| (all SIP dates) | -₹10,000 each |
| TODAY() | Current portfolio value |

## Which Metric When?

| Situation | Use | Why |
|-----------|-----|-----|
| SIP for < 1 year | Absolute Return | XIRR can be misleading for short periods |
| SIP for 1-3 years | XIRR | Accurate annualized return |
| SIP for 3+ years | XIRR | Standard for long-term SIP |
| Comparing with FD/PPF | XIRR | Apples-to-apples comparison |
| Quick mental math | CAGR | Rough estimate is fine |

## Real-World Examples

### Example 1: 3-Year SIP

| Details | Value |
|---------|-------|
| Monthly SIP | ₹15,000 |
| Duration | 36 months |
| Total invested | ₹5,40,000 |
| Current value | ₹7,20,000 |

**Calculations:**
- Absolute Return: (7,20,000 - 5,40,000) / 5,40,000 = 33.3%
- CAGR: (7,20,000 / 5,40,000)^(1/3) - 1 = 10.1%
- XIRR: ~18.5%

**Correct answer: 18.5% annualized return**

### Example 2: 5-Year SIP with Market Crash

| Year | Market | SIP Contribution | Value at Year End |
|------|--------|------------------|-------------------|
| 1 | Normal | ₹1,20,000 | ₹1,28,000 |
| 2 | Crash | ₹1,20,000 | ₹1,90,000 |
| 3 | Recovery | ₹1,20,000 | ₹4,10,000 |
| 4 | Bull | ₹1,20,000 | ₹6,50,000 |
| 5 | Normal | ₹1,20,000 | ₹8,20,000 |

**Calculations:**
- Total invested: ₹6,00,000
- Final value: ₹8,20,000
- Absolute Return: 36.7%
- CAGR: 6.4%
- XIRR: 14.2%

The crash in Year 2 actually helped—SIP bought more units at low prices!

## Common Mistakes in SIP Return Calculation

### Mistake 1: Using CAGR for SIP
CAGR assumes lumpsum investment. For SIP, it significantly underestimates returns.

### Mistake 2: Annualizing Short-Term Returns
"My SIP gave 8% in 3 months = 32% annualized!"

Don't extrapolate. Short-term returns are volatile and misleading.

### Mistake 3: Ignoring Dividends
If your SIP is in dividend payout mode, include dividends received in the final value.

### Mistake 4: Wrong Date for Final Value
Use today's date (for ongoing SIP) or redemption date (for closed SIP), not an arbitrary date.

### Mistake 5: Comparing SIP XIRR with Lumpsum CAGR
An SIP XIRR of 15% is NOT comparable to a mutual fund's 3-year CAGR of 15%. The fund's CAGR is for lumpsum; your XIRR is for SIP.

## Interpreting Your SIP Returns

### What's a Good XIRR?

| XIRR Range | Rating | Context |
|------------|--------|---------|
| < 8% | Below average | Below FD returns |
| 8-12% | Average | Market returns |
| 12-15% | Good | Above average |
| 15-18% | Very good | Strong performance |
| > 18% | Excellent | Top quartile |

### Factors Affecting SIP Returns

| Factor | Impact |
|--------|--------|
| Market timing (luck) | SIP started in crash = higher returns |
| Fund selection | Good fund vs bad fund = 3-5% difference |
| SIP duration | Longer = more stable XIRR |
| Asset class | Equity > Debt over long term |

## Tracking Your SIP Returns

### Option 1: Mutual Fund Apps
Most apps (Groww, Zerodha Coin, Kuvera) show XIRR automatically.

### Option 2: Consolidated Account Statement (CAS)
Order from CAMS/KFintech. Calculate XIRR from transaction history.

### Option 3: Manual Excel Tracking
Maintain spreadsheet with:
- Date of each SIP
- Amount invested
- NAV at purchase
- Units allocated

Calculate XIRR periodically.

## Conclusion

| Method | When to Use | Accuracy |
|--------|-------------|----------|
| Absolute Return | < 1 year, quick check | Low |
| CAGR | Rough estimate | Medium |
| **XIRR** | **Always for SIP** | **High** |

For SIP investments, XIRR is the only correct method to calculate returns. It accounts for the timing of each investment and gives you a true annualized rate.

Don't be misled by absolute returns or CAGR—calculate your XIRR to know your real SIP performance.

---

*Calculate your SIP growth:* Use our [SIP Calculator](/sip-calculator) to project future returns and plan your investments.
