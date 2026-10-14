"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./button-styles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return <button data-variant={variant} className={`${buttonClass(variant, size)} ${className}`} {...props} />;
}

/** A submit button that disables itself while its form's action is pending. */
export function SubmitButton({ disabled, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending || disabled} aria-busy={pending || undefined} {...props} />;
}
