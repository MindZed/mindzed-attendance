// app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "student@university.edu" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // 1. Find the user in our Neon database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // 2. Check if user exists and has a password
        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        // 3. Verify the password hash
        const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // 4. Return the user object to be stored in the session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // If user just logged in, attach their id and role to the JWT token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Temporary 'any' cast to bypass TS warning until we define global types
      }
      return token;
    },
    async session({ session, token }) {
      // Pass the token data to the client-side session
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login", // This tells NextAuth to use our custom login page (which we will build next)
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };