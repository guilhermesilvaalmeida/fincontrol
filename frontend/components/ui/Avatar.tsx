import clsx from "clsx";

export function Avatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = { sm: "h-8 w-8 text-xs", md: "h-11 w-11 text-sm", lg: "h-20 w-20 text-2xl" };
  const initials = name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={clsx("rounded-full object-cover", sizeClasses[size])} />;
  }

  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-full bg-emerald-50 font-semibold text-emerald-600 dark:bg-emerald/10 dark:text-emerald",
        sizeClasses[size]
      )}
    >
      {initials || "?"}
    </div>
  );
}
