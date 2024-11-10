import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { getUserById } from "./data/user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        return true;
      }
      if (!user.id) return false;
      const existingUser = await getUserById(user.id);
      if (!existingUser?.emailVerified) return false;
      // TODO add email verification
      return true;
    },
    async session({ token, session }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;
      token.role = existingUser.role;
      return token;
    },
  },
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
});
