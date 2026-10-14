import { SubmitButton } from "./button";
import type { ButtonSize, ButtonVariant } from "./button-styles";

/** A single-button form that runs a (usually `.bind`-ed) Server Action. */
export function ActionButton({
  action,
  label,
  variant = "secondary",
  size = "sm",
}: {
  action: () => Promise<void>;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <form action={action}>
      <SubmitButton variant={variant} size={size}>
        {label}
      </SubmitButton>
    </form>
  );
}
