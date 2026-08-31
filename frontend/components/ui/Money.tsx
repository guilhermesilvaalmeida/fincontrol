import clsx from "clsx";
import { formatBRL } from "@/lib/currency";

export function Money({
  value,
  className,
  tone = "default",
}: {
  value: number;
  className?: string;
  tone?: "default" | "positive" | "negative" | "muted";
}) {
  const toneClasses = {
    default: "text-ink dark:text-white",
    positive: "text-emerald",
    negative: "text-danger",
    muted: "text-ink-400",
  };

  return <span className={clsx("money", toneClasses[tone], className)}>{formatBRL(value)}</span>;
}
