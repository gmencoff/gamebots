"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/editor"); // Redirect to editor after successful sign-up
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Coup Bot Editor</h1>
      <h2 style={{ marginBottom: "20px" }}>Sign Up</h2>
      <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px", border: "1px solid white", borderRadius: "5px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px", border: "1px solid white", borderRadius: "5px" }}
        />
        <button type="submit" style={{ padding: "10px", fontSize: "16px", cursor: "pointer" }}>Sign Up</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Link href="/login" style={{ display: "block", marginTop: "10px", padding: "10px", textDecoration: "none", color: "white", backgroundColor: "gray", borderRadius: "5px" }}>
        Go to Login
      </Link>
    </div>
  );
};

export default Signup;
