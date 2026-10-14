import { z } from "zod";
import { strings } from "@/lib/strings";
import { toParseResult } from "./validation";

const { errors } = strings;

export const MEMBER_COLORS = Object.keys(strings.colors);

const blankToNull = (value: unknown) => (typeof value === "string" && value.trim() === "" ? null : value);
const name = z.string(errors.required).trim().min(1, errors.required).max(60, errors.tooLong);

const householdSchema = z.object({ name });

const memberSchema = z.object({
  name,
  color: z.preprocess(
    blankToNull,
    z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, errors.invalidColor)
      .nullable()
      .default(null),
  ),
});

const inviteSchema = z.object({
  email: z.preprocess(
    (value) => (typeof value === "string" ? blankToNull(value.trim().toLowerCase()) : value),
    z.email(errors.invalidEmail).nullable().default(null),
  ),
  memberId: z.preprocess(blankToNull, z.string().nullable().default(null)),
});

/** Validates a household name. */
export const parseHouseholdInput = (raw: unknown) => toParseResult(householdSchema.safeParse(raw));
/** Validates a member profile (name and optional hex color). */
export const parseMemberInput = (raw: unknown) => toParseResult(memberSchema.safeParse(raw));
/** Validates an invite (optional email to notify, optional member profile to take over). */
export const parseInviteInput = (raw: unknown) => toParseResult(inviteSchema.safeParse(raw));

/** The household to open: the last one used if the user still belongs to it, else the first, else `null`. */
export function pickCurrentHousehold(householdIds: string[], lastHouseholdId: string | null): string | null {
  if (lastHouseholdId && householdIds.includes(lastHouseholdId)) return lastHouseholdId;
  return householdIds[0] ?? null;
}
