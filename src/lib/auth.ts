import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findFirst({
          where: { email: credentials.email as string },
          include: { tenant: true },
        });

        if (!user) return null;

        // Demo mode: accept "demo123" as password for all demo users
        // In production, verify against hashed password stored in Account
        const demoPassword = 'demo123';
        if (credentials.password !== demoPassword) {
          // For non-demo passwords, check against stored hash in Account
          const account = await db.account.findFirst({
            where: { userId: user.id, provider: 'credentials' },
          });
          if (account?.access_token) {
            // access_token field stores the hashed password
            const isValid = await bcrypt.compare(
              credentials.password as string,
              account.access_token
            );
            if (!isValid) return null;
          } else {
            return null;
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as Record<string, unknown>).role;
        token.tenantId = (user as Record<string, unknown>).tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).tenantId = token.tenantId;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
});
