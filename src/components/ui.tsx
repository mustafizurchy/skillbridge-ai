import type { ReactNode } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Heading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {children}
    </header>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
export function Resource({ href }: { href: string }) {
  return (
    <a className="text-link" href={href} target="_blank" rel="noreferrer">
      Read the reference <ArrowUpRight size={15} />
    </a>
  );
}
export function Saved() {
  return (
    <span className="saved">
      <CheckCircle2 size={14} /> Progress saved
    </span>
  );
}
