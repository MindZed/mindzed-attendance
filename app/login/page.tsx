// app/login/page.tsx
// This file handles authentication for the application. It includes a highly secure
// "First-Run" detection system to bootstrap the initial Super Admin account without
// manual database seeding. For existing users, it handles credential login and
// dynamically routes them to their role-specific dashboards.

"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getSystemStatus, registerFirstAdmin } from "@/lib/actions/auth";

export default function LoginPage() {
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only for Admin Setup
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 1. Check if database is empty on mount
  useEffect(() => {
    async function checkStatus() {
      const status = await getSystemStatus();
      setIsFirstRun(status.isFirstRun);
    }
    checkStatus();
  }, []);

  // 2. Handle standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
    } else {
      // Fetch the session to determine the user's role dynamically
      const session = await getSession();
      const userRole = session?.user?.role?.toLowerCase() || "student"; // defaults to student just in case

      // Redirect to the role-based dashboard
      router.push(`/${userRole}/dashboard`);
      router.refresh(); // Force a refresh so layout fetches the new session state
    }
  };

  // 3. Handle First-Run Admin Registration
  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    const result = await registerFirstAdmin(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      // After registration, silently log them in and push to Admin dashboard
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!signInResult?.error) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError("Account created, but auto-login failed. Please log in.");
        setIsLoading(false);
      }
    }
  };

  if (isFirstRun === null) return <div className="flex h-screen items-center justify-center">Loading System...</div>;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Qadir: This is the headless container. Replace these generic HTML tags with your custom Card, Input, and Button UI components! */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        
        {isFirstRun ? (
          <section>
            <h1 className="text-2xl font-bold mb-2">Initial Admin Setup</h1>
            <p className="text-sm text-gray-500 mb-6">No users detected. Register the first Super Admin account.</p>
            <form onSubmit={handleAdminSetup} className="space-y-4">
              <input 
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Full Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
              <input 
                className="w-full px-4 py-2 border rounded-lg"
                type="email" 
                placeholder="Admin Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <input 
                className="w-full px-4 py-2 border rounded-lg"
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-black text-white font-medium py-2 rounded-lg disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Initialize System"}
              </button>
            </form>
          </section>
        ) : (
          <section>
            <h1 className="text-2xl font-bold mb-6">Log In</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                className="w-full px-4 py-2 border rounded-lg"
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <input 
                className="w-full px-4 py-2 border rounded-lg"
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-black text-white font-medium py-2 rounded-lg disabled:opacity-50"
              >
                {isLoading ? "Authenticating..." : "Auth In"}
              </button>
            </form>
            <p className="text-sm text-blue-600 mt-4 cursor-pointer hover:underline text-center">Forgot Password?</p>
          </section>
        )}
        {error && <p className="text-sm text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </main>
  );
}