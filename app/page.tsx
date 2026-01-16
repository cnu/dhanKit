import { CalculatorCard } from "@/components/layout";

const calculators = [
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
    title: "XIRR Calculator",
    description: "Calculate returns on irregular cash flows",
    href: "/xirr-calculator",
    icon: "🧮",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Smart calculators for smarter{" "}
          <span className="text-primary">financial decisions</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Free financial calculators designed for Indian investors. Plan your
          investments, calculate EMIs, and make informed decisions.
        </p>
      </section>

      {/* Calculator Grid */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Popular Calculators</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((calc) => (
            <CalculatorCard
              key={calc.href}
              title={calc.title}
              description={calc.description}
              href={calc.href}
              icon={calc.icon}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
