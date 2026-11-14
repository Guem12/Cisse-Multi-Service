import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

function decodeBase32(secret) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const character of secret) {
    value = (value << 5) | alphabet.indexOf(character);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function currentTotp(secret) {
  const counter = BigInt(Math.floor(Date.now() / 30_000));
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(counter);
  const digest = createHmac("sha1", decodeBase32(secret)).update(message).digest();
  const position = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[position] & 0x7f) << 24) |
    ((digest[position + 1] & 0xff) << 16) |
    ((digest[position + 2] & 0xff) << 8) |
    (digest[position + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

test("recovery admin remains independent of the modified profile and requires TOTP", async () => {
  const originalCwd = process.cwd();
  const envNames = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "ADMIN_TOTP_SECRET",
    "ADMIN_RECOVERY_EMAIL",
    "ADMIN_RECOVERY_PASSWORD",
    "ADMIN_RECOVERY_TOTP_SECRET",
  ];
  const originalEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "cisse-admin-recovery-"));
  const totpSecret = "JBSWY3DPEHPK3PXP";

  try {
    process.chdir(tempDir);
    delete process.env.DATABASE_URL;
    process.env.AUTH_SECRET = "test-session-secret";
    process.env.ADMIN_EMAIL = "primary@example.com";
    process.env.ADMIN_PASSWORD = "primary-env-password";
    delete process.env.ADMIN_TOTP_SECRET;
    process.env.ADMIN_RECOVERY_EMAIL = "recovery@example.com";
    process.env.ADMIN_RECOVERY_PASSWORD = "different-recovery-password";
    process.env.ADMIN_RECOVERY_TOTP_SECRET = totpSecret;

    await mkdir(path.join(tempDir, "data"));
    await writeFile(
      path.join(tempDir, "data", "admin-profile.json"),
      JSON.stringify({ email: "changed@example.com", password: "changed-profile-password" }),
    );

    const authUrl = new URL("../lib/auth.js", import.meta.url);
    authUrl.searchParams.set("test", String(Date.now()));
    const { createAdminSessionCookie, verifyAdminCredentials } = await import(authUrl.href);

    assert.equal(
      await verifyAdminCredentials("recovery@example.com", "different-recovery-password"),
      null,
    );

    const recoveryAdmin = await verifyAdminCredentials(
      "recovery@example.com",
      "different-recovery-password",
      currentTotp(totpSecret),
    );
    assert.deepEqual(recoveryAdmin, {
      email: "recovery@example.com",
      name: "Administrateur de secours",
      accountType: "recovery",
    });

    const cookie = createAdminSessionCookie(recoveryAdmin);
    const encodedPayload = cookie.split(";")[0].split("=")[1].split(".")[0];
    const session = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    assert.equal(session.accountType, "recovery");

    const primaryAdmin = await verifyAdminCredentials("changed@example.com", "changed-profile-password");
    assert.equal(primaryAdmin?.accountType, "primary");
  } finally {
    process.chdir(originalCwd);
    for (const [name, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    await rm(tempDir, { recursive: true, force: true });
  }
});
