import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

test("a saved admin password invalidates the previous environment password", async () => {
  const originalCwd = process.cwd();
  const envNames = ["DATABASE_URL", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
  const originalEnv = Object.fromEntries(
    envNames.map((name) => [name, process.env[name]]),
  );
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "cisse-admin-password-"));

  try {
    process.chdir(tempDir);
    delete process.env.DATABASE_URL;
    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.ADMIN_PASSWORD = "old-password";

    await mkdir(path.join(tempDir, "data"));
    await writeFile(
      path.join(tempDir, "data", "admin-profile.json"),
      JSON.stringify({
        email: "admin@example.com",
        password: "new-password",
      }),
    );

    const authUrl = new URL("../lib/auth.js", import.meta.url);
    authUrl.searchParams.set("test", String(Date.now()));
    const { verifyAdminCredentials } = await import(authUrl.href);

    assert.ok(await verifyAdminCredentials("admin@example.com", "new-password"));
    assert.equal(await verifyAdminCredentials("admin@example.com", "old-password"), null);
  } finally {
    process.chdir(originalCwd);
    for (const [name, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    await rm(tempDir, { recursive: true, force: true });
  }
});
