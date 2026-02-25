// app/login/page.tsx

"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
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
      router.push("/");
      router.refresh();
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
      // After registration, immediately log them in
      await signIn("credentials", {
        redirect: true,
        callbackUrl: "/",
        email,
        password,
      });
    }
  };

  if (isFirstRun === null) return <div>Loading System...</div>;

  return (
    <main>
      {isFirstRun ? (
        <section>
          <h1>Initial Admin Setup</h1>
          <p>No users detected. Register the first Super Admin account.</p>
          <form onSubmit={handleAdminSetup}>
            <input 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Initialize System"}
            </button>
          </form>
        </section>
      ) : (
        <section>
          <h1>Log In</h1>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Auth In"}
            </button>
          </form>
          <p>Forgot Password?</p>
        </section>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}