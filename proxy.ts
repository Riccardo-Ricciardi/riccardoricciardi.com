import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { APP_CONFIG, isSupportedLanguage } from "@/utils/config/app";

const LOCALE_COOKIE = "NEXT_LOCALE";

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && isSupportedLanguage(cookie)) return cookie;

  const accept = request.headers.get("accept-language") ?? "";
  const candidates = accept
    .split(",")
    .map((p) => p.trim().split(";")[0].slice(0, 2).toLowerCase());

  for (const lang of candidates) {
    if (isSupportedLanguage(lang)) return lang;
  }
  return APP_CONFIG.defaultLanguage;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const firstSegment = pathname.split("/")[1] ?? "";
  const hasLocale = isSupportedLanguage(firstSegment);

  if (!hasLocale) {
    const locale = detectLocale(request);
    const target = request.nextUrl.clone();
    target.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(target, 308);
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
