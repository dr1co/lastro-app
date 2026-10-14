import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/entrar", "/cadastro", "/verifique-seu-email", "/esqueci-a-senha", "/redefinir-senha"];

/** Optimistic check: sends visitors without a session cookie to sign-in, keeping where they were going. */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/convite/") || getSessionCookie(request)) {
    return NextResponse.next();
  }
  const url = new URL("/entrar", request.url);
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
