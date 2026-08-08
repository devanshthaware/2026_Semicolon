import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { db } from "./lib/db";
import { authConfig } from "./auth.config";
import { ensureAdminProvisioned } from "./lib/admin-bootstrap";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: "Email and password",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        // Run admin provision check if authenticating as initial admin email
        const adminEmail = (process.env.ADMIN_EMAIL || "hackytricky8.30@gmail.com").toLowerCase().trim();
        if (email === adminEmail) {
          await ensureAdminProvisioned();
        }

        const user = email ? await db.user.findUnique({ where: { email } }) : null;
        if (!user?.passwordHash || !(await compare(password, user.passwordHash))) return null;
        if ((user as any).status === "SUSPENDED") return null;

        return { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: (user as any).role || "USER", 
          status: (user as any).status || "ACTIVE" 
        } as any;
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
        token.status = (user as any).status || "ACTIVE";

        const memberships = await db.organizationMember.findMany({
          where: { userId: user.id },
          include: { organization: true },
        });
        if (memberships.length > 0) {
          token.activeOrgId = memberships[0].organizationId;
          token.activeOrgSlug = memberships[0].organization.slug;
        }
      }
      return token;
    }
  }
});
