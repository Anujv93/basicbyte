import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const user = await supabase.auth.getUser();

  const url = request.nextUrl;
  let hostname = request.headers;
  const host = hostname.get("host");
  const searchParams = url.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  const customSubDomain = hostname
    .get("host")
    ?.split(".localhost:3000")
    .filter(Boolean)[0];
  if (
    (host === "localhost:3000" && url.pathname === "/") ||
    (url.pathname === "/site" && host === "localhost:3000")
  ) {
    return NextResponse.rewrite(new URL("/site", request.url));
  }

  if (host === "admin.localhost:3000" && user.data.user !== null) {
    return NextResponse.rewrite(new URL("/dashboard", request.url));
  } else if (host === "admin.localhost:3000" && user.data.user === null) {
    return NextResponse.rewrite(new URL("/dashboard/signin", request.url));
  }

  return response;
}
