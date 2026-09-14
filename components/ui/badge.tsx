import * as React from "react";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  active: "bg-accent/15 text-accent",
  closed: "bg-muted text-muted-foreground",
  warn: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
