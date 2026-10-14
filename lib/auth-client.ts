import { createAuthClient } from "better-auth/react";

/** Browser-side Better Auth client; only used for redirects that must start in the browser (Google sign-in). */
export const authClient = createAuthClient();
