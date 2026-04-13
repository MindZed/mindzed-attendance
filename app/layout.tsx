// app/layout.tsx
// This is the root layout for the entire Next.js application. It wraps every page
// in the app, injecting the global CSS, configuring the default Inter font, and 
// wrapping the application in the NextAuth Session Provider for global auth state.

import type { Metadata } from "next";
import { Inter } from "next/font/google";
// Changed to absolute alias to fix the TypeScript "Cannot find module" error
import "@/app/globals.css"; 
import { AuthProvider } from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Attendance PWA",
  description: "University Attendance Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}