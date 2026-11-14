import assert from "node:assert/strict";
import { test } from "node:test";

test("development login rate limiting falls back to memory when PostgreSQL is unavailable", async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalConsoleError = console.error;
  const logs = [];

  process.env.NODE_ENV = "development";
  process.env.DATABASE_URL = "postgresql://diagnostic:diagnostic@127.0.0.1:1/cisse_test";
  console.error = (...args) => logs.push(args);

  try {
    const moduleUrl = new URL("../lib/auth-rate-limit.js", import.meta.url);
    moduleUrl.searchParams.set("test", String(Date.now()));
    const { consumeLoginAttempt } = await import(moduleUrl.href);
    const request = new Request("http://localhost/api/auth/login", {
      headers: { "x-forwarded-for": "192.0.2.234" },
    });

    const result = await consumeLoginAttempt(request);

    assert.equal(result.allowed, true);
    assert.ok(
      logs.some(([message]) => message === "Administrator login rate-limit database error:"),
    );
  } finally {
    console.error = originalConsoleError;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
  }
});
