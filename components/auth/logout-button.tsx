// components/auth/logout-button.tsx
// This Client Component provides a simple, reusable logout button.
// It uses NextAuth's signOut function to securely clear the user's session
// and automatically redirects them back to the login page.

"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        marginTop: "10px",
        padding: "8px 16px",
        backgroundColor: "#ff4444",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
      }}
    >
      Logout / Sign Out
    </button>
  );
}