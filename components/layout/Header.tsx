import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="dhanKit"
            width={887}
            height={338}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/articles"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Articles
          </Link>
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
