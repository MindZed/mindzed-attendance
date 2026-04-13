// types/next-auth.d.ts
// This file extends NextAuth's default TypeScript definitions to recognize our custom 
// database fields. By globally declaring 'id' and 'role' on the Session, User, and JWT 
// interfaces, we ensure strict end-to-end type safety and eliminate the need for type 
// casting hacks during authentication and route protection.

import { DefaultSession, DefaultUser } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}