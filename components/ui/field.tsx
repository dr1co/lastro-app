"use client";

import { useId, type InputHTMLAttributes } from "react";
import { useFormField } from "./form-context";

type Option = { value: string; label: string };

type FieldProps = {
  label: string;
  name: string;
  hint?: string;
  options?: Option[];
  defaultValue?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "defaultValue">;

const controlClass =
  "h-12 w-full rounded-field border border-border bg-surface px-3 text-base text-text outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/30 aria-invalid:border-negative";

/**
 * A labelled input, or a select when `options` is given.
 * Inside an `ActionForm` it shows the field's error and restores the value submitted last.
 */
export function Field({ label, name, hint, options, defaultValue, className, ...inputProps }: FieldProps) {
  const id = useId();
  const { error, value } = useFormField(name);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const common = {
    id,
    name,
    defaultValue: value ?? defaultValue,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: controlClass,
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>
      {options ? (
        <select {...common} key={common.defaultValue}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input {...common} {...inputProps} />
      )}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-negative">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
