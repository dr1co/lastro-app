import { Field } from "@/components/ui/field";
import { strings } from "@/lib/strings";

const colorOptions = [
  { value: "", label: strings.members.noColor },
  ...Object.entries(strings.colors).map(([value, label]) => ({ value, label })),
];

/** Name and color fields shared by the add and edit member forms. */
export function MemberFields({ defaults }: { defaults?: { name: string; color: string | null } }) {
  return (
    <>
      <Field label={strings.fields.name} name="name" defaultValue={defaults?.name} autoComplete="off" />
      <Field label={strings.fields.color} name="color" options={colorOptions} defaultValue={defaults?.color ?? ""} />
    </>
  );
}

/** A small colored dot for a member, falling back to the border color. */
export function MemberDot({ color }: { color: string | null }) {
  return <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: color ?? "var(--border)" }} />;
}
