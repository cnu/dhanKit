export interface Calculator {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export const calculators: Calculator[] = [
  {
    title: "SIP Calculator",
    description: "Calculate returns on your monthly SIP investments",
    href: "/sip-calculator",
    icon: "📈",
  },
  {
    title: "EMI Calculator",
    description: "Calculate EMI for home, car, or personal loans",
    href: "/emi-calculator",
    icon: "🏠",
  },
  {
    title: "PPF Calculator",
    description: "Calculate Public Provident Fund maturity amount",
    href: "/ppf-calculator",
    icon: "🏦",
  },
  {
    title: "FD Calculator",
    description: "Calculate fixed deposit maturity and interest",
    href: "/fd-calculator",
    icon: "💰",
  },
  {
    title: "Lumpsum Calculator",
    description: "Calculate returns on one-time investments",
    href: "/lumpsum-calculator",
    icon: "💵",
  },
  {
    title: "NPS Calculator",
    description: "Calculate National Pension System corpus and pension",
    href: "/nps-calculator",
    icon: "👴",
  },
  {
    title: "SWP Calculator",
    description: "Plan systematic withdrawals from your investments",
    href: "/swp-calculator",
    icon: "💸",
  },
  {
    title: "CAGR Calculator",
    description: "Calculate compound annual growth rate of investments",
    href: "/cagr-calculator",
    icon: "📊",
  },
  {
    title: "RD Calculator",
    description: "Calculate recurring deposit maturity amount",
    href: "/rd-calculator",
    icon: "🏧",
  },
  {
    title: "Cost of Delay Calculator",
    description: "See how much you lose by delaying investments",
    href: "/cost-of-delay-calculator",
    icon: "⏳",
  },
  {
    title: "Goal Planner Calculator",
    description: "Calculate the monthly SIP needed to reach your goals",
    href: "/goal-planner-calculator",
    icon: "🎯",
  },
  {
    title: "Gratuity Calculator",
    description: "Calculate gratuity for 5+ years of service",
    href: "/gratuity-calculator",
    icon: "🎁",
  },
  {
    title: "Retirement Calculator",
    description: "Plan your FIRE journey with inflation-adjusted projections",
    href: "/retirement-calculator",
    icon: "🏖️",
  },
];

/**
 * Get calculators excluding the current one
 */
export function getRelatedCalculators(currentHref: string): Calculator[] {
  return calculators.filter((calc) => calc.href !== currentHref);
}
