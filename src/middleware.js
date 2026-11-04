import { defineMiddleware } from "astro:middleware";
import { isAdmin } from "../lib/guard";

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith("/admin") && !isAdmin(context.request)) {
    const loginUrl = new URL("/login", context.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${context.url.pathname}${context.url.search}`,
    );
    return context.redirect(loginUrl);
  }

  return next();
});
