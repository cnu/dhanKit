import Link from "next/link";

interface CalculatorLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function CalculatorLayout({
  title,
  description,
  children,
}: CalculatorLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
      >
        ← Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-8">{description}</p>

      {children}
    </div>
  );
}
