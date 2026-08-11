"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    // Validate fields
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Validate password
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    // Create Supabase account
    const { data, error: signupError } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

    // Handle signup error
    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    // Make sure user was created
    if (!data.user) {
      setError("Account could not be created. Please try again.");
      setLoading(false);
      return;
    }

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        full_name: name,
        email: email,
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);

      setError(
        "Account was created, but your profile could not be saved. Please contact support."
      );

      setLoading(false);
      return;
    }

    setLoading(false);

    // Go to dashboard
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">

        {/* Logo and Heading */}
        <div className="mb-8 text-center">

          <Link
            href="/"
            className="text-3xl font-bold"
          >
            StudyMate<span className="text-blue-500"> AI</span>
          </Link>

          <h1 className="mt-8 text-3xl font-bold">
            Create your account
          </h1>

          <p className="mt-2 text-slate-400">
            Start creating personalized study material.
          </p>

        </div>


        {/* Signup Form */}
        <form
          onSubmit={handleSignup}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >

          {/* Error Message */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}


          {/* Full Name */}
          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

          </div>


          {/* Email */}
          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

          </div>


          {/* Password */}
          <div className="mb-6">

            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

          </div>


          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>


          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-400">

            Already have an account?{" "}

            <Link
              href="/login"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Login
            </Link>

          </p>

        </form>

      </div>
    </main>
  );
}