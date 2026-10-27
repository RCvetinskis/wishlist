import { cn } from "@/lib/utils";

type RibbonPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center"
  | "left-center"
  | "right-center"
  | "diagonal-left"
  | "diagonal-right"
  | "across";

type RibbonVariant = "primary" | "secondary" | "secondaryForeground";

interface RibbonProps {
  children: React.ReactNode;
  position?: RibbonPosition;
  variant?: RibbonVariant;
  className?: string;
}

const variants: Record<RibbonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  secondaryForeground: "bg-secondary-foreground",
};

const positions: Record<RibbonPosition, string> = {
  "top-left": "top-4 left-0 rounded-r-md",
  "top-right": "top-4 right-0 rounded-l-md",
  "bottom-left": "bottom-4 left-0 rounded-r-md",
  "bottom-right": "bottom-4 right-0 rounded-l-md",
  "top-center": "top-4 left-1/2 -translate-x-1/2 rounded-md",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 rounded-md",
  "left-center": "left-0 top-1/2 -translate-y-1/2 rounded-r-md",
  "right-center": "right-0 top-1/2 -translate-y-1/2 rounded-l-md",
  "diagonal-left": "top-10 -left-10 w-40 -rotate-45 justify-center text-center",
  "diagonal-right":
    "top-10 -right-10 w-40 rotate-45 justify-center text-center",
  across: "top-1/2 left-0 w-full -translate-y-1/2 justify-center text-center",
};

export function Ribbon({
  children,
  position = "top-right",
  variant = "primary",
  className,
}: RibbonProps) {
  return (
    <div
      className={cn(
        "absolute z-10 flex items-center px-4 py-1.5 text-xs font-bold shadow-md",
        positions[position],
        variants[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
