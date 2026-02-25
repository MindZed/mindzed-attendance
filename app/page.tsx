// app/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LogoutButton from "@/components/auth/logout-button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Lets Build Attendance System Together!</h1>
      
      {session ? (
        <div style={{ 
          marginTop: "1.5rem", 
          padding: "1rem", 
          border: "2px solid #0070f3", 
          borderRadius: "8px",
          backgroundColor: "#f0f7ff" 
        }}>
          <p>Welcome back, <strong>{session.user?.name}</strong>!</p>
          <p>Role: <strong>{session.user?.role}</strong></p>
          
          {/* Add the Logout Button here */}
          <LogoutButton />
        </div>
      ) : (
        <p>You are not logged in.</p>
      )}
    </main>
  );
}