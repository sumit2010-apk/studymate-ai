"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PDFPage() {
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);

  const [type, setType] = useState("summary");

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [extractedText, setExtractedText] = useState("");
  const [generatedResult, setGeneratedResult] = useState("");

  async function handleUpload() {
    setError("");
    setSuccess("");
    setExtractedText("");
    setGeneratedResult("");

    if (!file) {
      setError("Please select a PDF first.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to process PDF."
        );
      }

      setExtractedText(data.text);

      setSuccess(
        `PDF processed successfully! ${data.pages} page(s) detected.`
      );
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


  // GENERATE AI MATERIAL
  async function handleGenerate() {
    setError("");
    setSuccess("");
    setGeneratedResult("");

    if (!extractedText) {
      setError("Please process the PDF first.");
      return;
    }

    setGenerating(true);

    try {
      /*
       * We send the extracted PDF text as part of the topic.
       * This allows the existing /api/generate route
       * to use the PDF content without creating another
       * AI API route.
       */

      const response = await fetch("/api/generate", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          subject: file?.name || "Uploaded PDF",

          topic: `
Use the following PDF content as the ONLY source material.

Create the requested ${type} based on this PDF.

PDF CONTENT:
${extractedText}
`,

          type: type,

          difficulty: "intermediate",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "AI generation failed."
        );
      }

      setGeneratedResult(data.result);

      setSuccess(
        "AI study material generated successfully! 🤖"
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate AI material."
      );
    } finally {
      setGenerating(false);
    }
  }


  // SAVE MATERIAL
  async function handleSave() {
    setError("");
    setSuccess("");

    if (!generatedResult) {
      setError("Generate AI material first.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Please login before saving material."
        );
      }

      const { error: insertError } = await supabase
        .from("materials")
        .insert({
          user_id: user.id,

          subject:
            file?.name || "Uploaded PDF",

          topic:
            `${type} from ${file?.name || "PDF"}`,

          material_type: type,

          difficulty: "intermediate",

          content: generatedResult,
        });

      if (insertError) {
        console.error(
          "Save material error:",
          insertError
        );

        throw new Error(
          insertError.message
        );
      }

      setSuccess(
        "Study material saved successfully! ✅"
      );

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
            StudyMate
            <span className="text-blue-500">
              AI
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            ← Dashboard
          </Link>

        </div>

      </nav>


      {/* MAIN */}

      <section className="mx-auto max-w-5xl px-6 py-12">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold">
            Study From PDF
          </h1>

          <p className="mt-3 text-slate-400">
            Upload your study material and let StudyMate AI
            turn it into useful learning resources.
          </p>

        </div>


        {/* UPLOAD CARD */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <label className="mb-3 block font-medium">
            Select PDF
          </label>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {

              const selectedFile =
                e.target.files?.[0] || null;

              setFile(selectedFile);

              setError("");
              setSuccess("");
              setExtractedText("");
              setGeneratedResult("");

            }}
            className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm"
          />


          {/* FILE INFO */}

          {file && (
            <div className="mt-4 rounded-lg bg-slate-950 p-4">

              <p className="font-medium">
                📄 {file.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>

            </div>
          )}


          {/* TYPE */}

          <div className="mt-6">

            <label className="mb-2 block font-medium">
              What do you want to generate?
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            >

              <option value="summary">
                📝 Summary
              </option>

              <option value="notes">
                📚 Study Notes
              </option>

              <option value="mcqs">
                ❓ MCQs
              </option>

              <option value="flashcards">
                🃏 Flashcards
              </option>

            </select>

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


          {/* PROCESS PDF */}

          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loading
              ? "Processing PDF..."
              : "📄 Process PDF"}

          </button>

        </div>


        {/* EXTRACTED TEXT */}

        {extractedText && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">

            <h2 className="text-2xl font-bold">
              PDF Ready ✅
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Your PDF has been successfully processed.
            </p>


            <div className="mt-6 rounded-lg bg-slate-950 p-6">

              <p className="text-sm text-slate-400">
                Extracted text:
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {extractedText.length.toLocaleString()} characters
                extracted from the PDF.
              </p>

            </div>


            {/* GENERATE AI BUTTON */}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="mt-6 w-full rounded-lg bg-purple-600 px-6 py-4 font-semibold hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {generating
                ? "🤖 AI is generating..."
                : "✨ Generate with AI"}

            </button>

          </div>
        )}


        {/* AI RESULT */}

        {generatedResult && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">

            {/* HEADER */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm uppercase tracking-wide text-purple-400">
                  AI Generated
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {type === "summary" && "PDF Summary"}

                  {type === "notes" && "Study Notes"}

                  {type === "mcqs" && "Practice MCQs"}

                  {type === "flashcards" && "Flashcards"}
                </h2>

              </div>


              {/* SAVE */}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-green-600 px-5 py-3 font-semibold hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {saving
                  ? "Saving..."
                  : "💾 Save Material"}

              </button>

            </div>


            {/* RESULT */}

            <div className="mt-6 whitespace-pre-wrap rounded-lg bg-slate-950 p-6 leading-8 text-slate-300">
              {generatedResult}
            </div>

          </div>
        )}

      </section>

    </main>
  );
}