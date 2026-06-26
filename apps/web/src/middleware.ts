import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const protectedRoutes: Record<string, string[]> = {
  "/book": ["customer", "admin"],
  "/driver": ["driver", "admin"],
  "/admin": ["admin"],
};

const PUBLIC_PATHS = ["/book/new", "/book/orders/local", "/ops"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const response = await updateSession(request);

  const matchedRoute = Object.keys(protectedRoutes).find((route) =>
    path.startsWith(route)
  );

  if (!matchedRoute) return response;

  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const allowedRoles = protectedRoutes[matchedRoute];
  if (profile && !allowedRoles.includes(profile.role)) {
    if (profile.role === "driver") {
      return NextResponse.redirect(new URL("/driver", request.url));
    }
    if (profile.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/book", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/book/:path*", "/driver/:path*", "/admin/:path*"],
};
