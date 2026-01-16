export interface EMIResult {
  monthlyEMI: number;
  totalAmount: number;
  totalInterest: number;
  principalAmount: number;
}

export interface EMIMonthlyBreakdown {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Calculate EMI (Equated Monthly Installment) for a loan.
 *
 * Formula: EMI = P × [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 *   EMI = Equated Monthly Installment
 *   P = Principal loan amount
 *   r = Monthly interest rate = Annual rate / (12 × 100)
 *   n = Number of monthly installments (tenure in months)
 *
 * Total Amount = EMI × n
 * Total Interest = Total Amount - Principal
 *
 * This is the standard reducing balance EMI formula used by all
 * Indian banks and financial institutions.
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): EMIResult {
  // Handle edge case of 0% interest
  if (annualRate === 0) {
    const monthlyEMI = principal / tenureMonths;
    return {
      monthlyEMI: Math.round(monthlyEMI),
      totalAmount: principal,
      totalInterest: 0,
      principalAmount: principal,
    };
  }

  // Monthly interest rate
  const monthlyRate = annualRate / (12 * 100);

  // EMI formula: P × [r(1+r)^n] / [(1+r)^n - 1]
  const compoundFactor = Math.pow(1 + monthlyRate, tenureMonths);
  const monthlyEMI = (principal * monthlyRate * compoundFactor) / (compoundFactor - 1);

  const totalAmount = monthlyEMI * tenureMonths;
  const totalInterest = totalAmount - principal;

  return {
    monthlyEMI: Math.round(monthlyEMI),
    totalAmount: Math.round(totalAmount),
    totalInterest: Math.round(totalInterest),
    principalAmount: principal,
  };
}

/**
 * Generate month-by-month amortization schedule.
 *
 * For each month:
 *   Interest = Outstanding Balance × Monthly Rate
 *   Principal = EMI - Interest
 *   New Balance = Old Balance - Principal
 *
 * This shows how each EMI payment is split between principal
 * repayment and interest payment over the loan tenure.
 */
export function calculateEMIBreakdown(
  principal: number,
  annualRate: number,
  tenureMonths: number
): EMIMonthlyBreakdown[] {
  const breakdown: EMIMonthlyBreakdown[] = [];
  const { monthlyEMI } = calculateEMI(principal, annualRate, tenureMonths);
  const monthlyRate = annualRate / (12 * 100);

  let balance = principal;

  for (let month = 1; month <= tenureMonths; month++) {
    // Interest for this month on remaining balance
    const interestPayment = balance * monthlyRate;
    // Principal repaid this month
    const principalPayment = monthlyEMI - interestPayment;
    // Remaining balance after this payment
    balance = balance - principalPayment;

    // Avoid tiny floating point errors for final month
    if (month === tenureMonths) {
      balance = 0;
    }

    breakdown.push({
      month,
      emi: monthlyEMI,
      principal: Math.round(principalPayment),
      interest: Math.round(interestPayment),
      balance: Math.round(Math.max(0, balance)),
    });
  }

  return breakdown;
}

/**
 * Generate yearly summary of amortization.
 * Shows cumulative principal, interest, and balance at end of each year.
 */
export interface EMIYearlyBreakdown {
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  balance: number;
}

export function calculateEMIYearlyBreakdown(
  principal: number,
  annualRate: number,
  tenureMonths: number
): EMIYearlyBreakdown[] {
  const monthlyBreakdown = calculateEMIBreakdown(principal, annualRate, tenureMonths);
  const yearlyBreakdown: EMIYearlyBreakdown[] = [];

  const totalYears = Math.ceil(tenureMonths / 12);

  for (let year = 1; year <= totalYears; year++) {
    const startMonth = (year - 1) * 12;
    const endMonth = Math.min(year * 12, tenureMonths);

    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let i = startMonth; i < endMonth; i++) {
      yearlyPrincipal += monthlyBreakdown[i].principal;
      yearlyInterest += monthlyBreakdown[i].interest;
    }

    const balance = monthlyBreakdown[endMonth - 1].balance;

    yearlyBreakdown.push({
      year,
      principalPaid: Math.round(yearlyPrincipal),
      interestPaid: Math.round(yearlyInterest),
      totalPaid: Math.round(yearlyPrincipal + yearlyInterest),
      balance: Math.round(balance),
    });
  }

  return yearlyBreakdown;
}
