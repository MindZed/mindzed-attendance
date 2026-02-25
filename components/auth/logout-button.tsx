// components/auth/logout-button.tsx

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