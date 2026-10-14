export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-contrast hover:opacity-90",
  secondary: "border border-border bg-surface text-text hover:bg-accent-soft",
  ghost: "text-accent hover:bg-accent-soft",
  danger: "border border-negative/40 bg-negative-soft text-negative hover:opacity-90",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-12 px-5 text-base",
  sm: "h-9 px-3 text-sm",
};

/** Class names for a button-looking element; also used to style links. Safe to call from Server Components. */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return `inline-flex items-center justify-center gap-2 rounded-field font-semibold transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]}`;
}
