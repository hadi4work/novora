import type { NextRequest } from "next/server";

export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function getAuthCallbackUrl(redirectPath = "/dashboard"): string {
  const path = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
  return `${getAppUrl()}/auth/callback?redirect=${encodeURIComponent(path)}`;
}

export function getAppOrigin(request?: NextRequest): string {
  if (request) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost.split(",")[0]?.trim()}`;
    }
    return request.nextUrl.origin;
  }
  return getAppUrl();
}
