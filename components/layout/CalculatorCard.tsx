import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CalculatorCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export function CalculatorCard({ title, description, href, icon }: CalculatorCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardHeader>
          <div className="mb-2 text-3xl">{icon}</div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
