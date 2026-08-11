"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function GeneratePage() {
  const supabase = createClient();

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("notes");
  const [difficulty, setDifficulty] = useState("intermediate");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleGenerate() {
    setError("");
    setSuccess("");
    setResult("");

    if (!subject || !topic) {
      setError("Please enter both subject and topic.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          topic,
          type,
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate material."
        );
      }

      setResult(data.result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    if (!result) {
      setError("Please generate study material first.");
      return;
    }

    setSaving(true);

    try {
      // Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please login before saving material.");
      }

      // Insert into Supabase
      const { error: insertError } = await supabase
        .from("materials")
        .insert({
          user_id: user.id,
          subject: subject,
          topic: topic,
          material_type: type,
          difficulty: difficulty,
          content: result,
        });

      if (insertError) {
        console.error("Supabase save error:", insertError);
        throw new Error(insertError.message);
      }

      setSuccess("Study material saved successfully! ✅");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save material."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/dashboard"
            className="text-2xl font-bold"
          >
            StudyMate<span className="text-blue-500"> AI</span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>

        </div>
      </nav>

      {/* MAIN */}
      <section className="mx-auto max-w-5xl px-6 py-12">

        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Generate Study Material
          </h1>

          <p className="mt-3 text-slate-400">
            Enter a topic and let AI create personalized
            study material for you.
          </p>
        </div>

        {/* FORM */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

          {/* SUBJECT */}
          <div className="mb-6">
            <label className="mb-2 block font-medium">
              Subject
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Example: Computer Science"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* TOPIC */}
          <div className="mb-6">
            <label className="mb-2 block font-medium">
              Topic
            </label>

            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Example: Operating Systems"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* OPTIONS */}
          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block font-medium">
                Material Type
              </label>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
              >
                <option value="notes">Study Notes</option>
                <option value="mcqs">MCQs</option>
                <option value="flashcards">Flashcards</option>
                <option value="summary">Summary</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Difficulty
              </label>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-400">
              {success}
            </div>
          )}

          {/* GENERATE */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating..." : "✨ Generate with AI"}
          </button>

        </div>

        {/* RESULT */}
        {result && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">

            {/* RESULT HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <h2 className="text-2xl font-bold">
                Your Study Material
              </h2>

              {/* SAVE BUTTON */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-green-600 px-5 py-3 font-semibold hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "💾 Save Material"}
              </button>

            </div>

            {/* AI RESULT */}
            <div className="mt-6 whitespace-pre-wrap leading-8 text-slate-300">
              {result}
            </div>

          </div>
        )}

      </section>

    </main>
  );
}