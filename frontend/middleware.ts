import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];
const ADMIN_PATH_PREFIX = "/admin";

/**
 * Lê a role diretamente do payload do JWT (sem verificar assinatura) apenas para decidir
 * um redirecionamento de UX. Isso roda no servidor (middleware nunca expõe isso ao browser)
 * e NÃO é o mecanismo de segurança real — a autorização de verdade acontece no backend,
 * que sempre revalida a role atual no banco a cada requisição (ver JwtAuthFilter).
 */
function extractRoleFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    const claims = JSON.parse(decoded);
    return typeof claims.role === "string" ? claims.role : null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("fincontrol_token")?.value;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (token && pathname.startsWith(ADMIN_PATH_PREFIX)) {
    const role = extractRoleFromToken(token);
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)"],
};
