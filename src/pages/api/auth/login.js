import { createAdminSessionCookie, verifyAdminCredentials } from "../../../../lib/auth";
import { clearLoginFailures, consumeLoginAttempt } from "../../../../lib/auth-rate-limit";

export const prerender = false;

export async function POST({ request }) {
  const isJson = request.headers.get("content-type")?.includes("application/json");
  let email;
  let password;
  let totpCode;
  let callbackUrl = "/admin";

  if (isJson) {
    const body = await request.json();
    email = body.email;
    password = body.password;
    totpCode = body.totpCode;
    callbackUrl = body.callbackUrl || callbackUrl;
  } else {
    const form = await request.formData();
    email = form.get("email");
    password = form.get("password");
    totpCode = form.get("totpCode");
    callbackUrl = form.get("callbackUrl") || callbackUrl;
  }

  let safeCallback = "/admin";
  if (typeof callbackUrl === "string") {
    const targetUrl = new URL(callbackUrl, request.url);
    if (targetUrl.origin === new URL(request.url).origin) {
      safeCallback = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
    }
  }
  const rateLimit = await consumeLoginAttempt(request);
  if (!rateLimit.allowed) {
    if (isJson) {
      return Response.json(
        { error: "Trop de tentatives. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
      );
    }
    const loginUrl = new URL("/login?error=throttled", request.url);
    loginUrl.searchParams.set("callbackUrl", safeCallback);
    return new Response(null, {
      status: 303,
      headers: {
        Location: loginUrl.toString(),
        "Retry-After": String(rateLimit.retryAfter),
      },
    });
  }

  const admin = await verifyAdminCredentials(email, password, totpCode);

  if (!admin) {
    if (isJson) {
      return Response.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "credentials");
    loginUrl.searchParams.set("callbackUrl", safeCallback);
    return Response.redirect(loginUrl, 303);
  }

  try {
    await clearLoginFailures(request);
  } catch (error) {
    console.error("Unable to clear administrator login attempts:", error);
    if (isJson) {
      return Response.json({ error: "La connexion est temporairement indisponible." }, { status: 503 });
    }
    return Response.redirect(new URL("/login?error=unavailable", request.url), 303);
  }

  try {
    const cookie = createAdminSessionCookie(admin);
    if (isJson) {
      return Response.json({ success: true }, { headers: { "Set-Cookie": cookie } });
    }
    const redirectUrl = new URL(safeCallback, request.url);
    return new Response(null, {
      status: 303,
      headers: {
        "Location": redirectUrl.toString(),
        "Set-Cookie": cookie
      }
    });
  } catch (error) {
    console.error("Unable to create administrator session:", error);
    if (isJson) {
      return Response.json({ error: "La connexion administrateur n'est pas configurée." }, { status: 500 });
    }
    return Response.redirect(new URL("/login?error=configuration", request.url), 303);
  }
}
