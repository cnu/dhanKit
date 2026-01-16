import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIP Calculator - Calculate SIP Returns Online | dhanKit",
  description:
    "Calculate your SIP maturity amount with our free SIP calculator. See how your monthly investments grow over time.",
};

export default function SIPCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
