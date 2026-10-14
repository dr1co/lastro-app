"use client";

import { createContext, useContext } from "react";
import type { FormState } from "@/lib/forms";

const FormContext = createContext<NonNullable<FormState>>({});

export const FormStateProvider = FormContext.Provider;

/** The error and restored value for one field of the surrounding `ActionForm`. */
export function useFormField(name: string) {
  const state = useContext(FormContext);
  return { error: state.errors?.[name], value: state.values?.[name] };
}
