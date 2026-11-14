import { defineMiddleware } from "astro:middleware";
import { isAdmin } from "../lib/guard";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  if (normalizedPathname === "/admin/login") {
    if (isAdmin(context.request)) {
      return context.redirect(new URL("/admin", context.url));
    }

    const loginUrl = new URL("/login", context.url);
    loginUrl.searchParams.set("callbackUrl", "/admin");
    return context.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && !isAdmin(context.request)) {
    const loginUrl = new URL("/login", context.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${context.url.pathname}${context.url.search}`,
    );
    return context.redirect(loginUrl);
  }

  return next();
});
