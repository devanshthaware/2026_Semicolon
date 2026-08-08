import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = (token.role as string) || "USER";
        (session.user as any).status = (token.status as string) || "ACTIVE";
        session.user.activeOrgId = token.activeOrgId as string | undefined;
        session.user.activeOrgSlug = token.activeOrgSlug as string | undefined;
      }
      return session;
    }
  }
} satisfies NextAuthConfig;
