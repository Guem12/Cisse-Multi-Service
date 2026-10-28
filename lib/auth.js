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

        try {
          const profile = await getAdminProfile();
          const targetEmail = profile?.email || process.env.ADMIN_EMAIL;
          const targetPassword = profile?.password || process.env.ADMIN_PASSWORD;

          if (targetEmail && targetPassword && same(c.email, targetEmail) && same(c.password, targetPassword)) {
            return {
              id: "admin",
              name: `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Administrateur",
              email: targetEmail,
            };
          }
        } catch (e) {
          console.error("Auth authorize error:", e);
        }

        // Fallback variables d'environnement directes
        const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
        if (ADMIN_EMAIL && ADMIN_PASSWORD && same(c.email, ADMIN_EMAIL) && same(c.password, ADMIN_PASSWORD)) {
          return { id: "admin", name: "Administrateur", email: ADMIN_EMAIL };
        }

        return null;
      },
    }),
  ],
};
