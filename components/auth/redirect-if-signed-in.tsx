import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session";

/** Sends signed-in visitors to the dashboard. Render inside a `<Suspense>` boundary (it reads the session). */
export async function RedirectIfSignedIn() {
  if (await getSession()) redirect("/inicio");
  return null;
}
