import CredentialsProvider from "next-auth/providers/credentials";
import { timingSafeEqual } from "crypto";
import { getAdminProfile } from "./admin-profile";

const same = (a = "", b = "") => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

export const authOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Administrateur",
      credentials: { email: {}, password: {} },
      async authorize(c) {
        if (!c?.email || !c?.password) return null;

        // Utiliser l'URL base Neon auth si configurée
        const neonAuthBaseUrl = process.env.NEON_AUTH_BASE_URL;
        const effectiveSignInPath = neonAuthBaseUrl ? `/auth/signin?baseUrl=${neonAuthBaseUrl}` : "/login";

        try {
          const profile = await getAdminProfile();
          const targetEmail = profile?.email || process.env.ADMIN_EMAIL;
          const targetPassword = profile?.password || process.env.ADMIN_PASSWORD;

          if (targetEmail && targetPassword && same(c.email, targetEmail) && same(c.password, targetPassword)) {
            return {
              id: "admin",
              name: `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Administrateur",
              email: targetEmail,
              adminId: "admin",
            };
          }
        } catch (e) {
          console.error("Auth authorize error:", e);
        }

        // Fallback variables d'environnement directes
        const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
        if (ADMIN_EMAIL && ADMIN_PASSWORD && same(c.email, ADMIN_EMAIL) && same(c.password, ADMIN_PASSWORD)) {
          return { id: "admin", name: "Administrateur", email: ADMIN_EMAIL, adminId: "admin" };
        }

        return null;
      },
    }),
  ],
  // Neon auth configuration - used by @neondatabase/auth middleware
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Neon auth integration point
      if (process.env.NEON_AUTH_BASE_URL) {
        // Neon auth middleware will handle the redirect/validation
        return true;
      }
      return true;
    },
  },
};
