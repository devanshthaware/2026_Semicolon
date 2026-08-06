import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { db } from "./lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [Credentials({
    name: "Email and password",
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(credentials) {
      const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : "";
      const password = typeof credentials?.password === "string" ? credentials.password : "";
      const user = email ? await db.user.findUnique({ where: { email } }) : null;
      if (!user?.passwordHash || !(await compare(password, user.passwordHash))) return null;
      return { id: user.id, email: user.email, name: user.name };
    }
  })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
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
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.activeOrgId = token.activeOrgId as string | undefined;
        session.user.activeOrgSlug = token.activeOrgSlug as string | undefined;
      }
      return session;
    }
  }
});
