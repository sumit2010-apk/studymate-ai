"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import jsPDF from "jspdf";

type Material = {
  id: string;
  subject: string;
  topic: string;
  material_type: string;
  difficulty: string;
  content: string;
  created_at: string;
};

export default function MaterialPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMaterial() {
      try {
        const id = params.id as string;

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("materials")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (fetchError || !data) {
          throw new Error("Material not found.");
        }

        setMaterial(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load material."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMaterial();
  }, [params.id]);


  // DELETE MATERIAL
  async function handleDelete() {
    if (!material) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this study material?"
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error: deleteError } = await supabase
        .from("materials")
        .delete()
        .eq("id", material.id)
        .eq("user_id", user.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete material."
      );

      setDeleting(false);
    }
  }


  // DOWNLOAD PDF
  function handleDownloadPDF() {
    if (!material) return;

    const pdf = new jsPDF();

    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const maxWidth = pageWidth - margin * 2;

    let y = 20;

    // TITLE
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");

    pdf.text(
      "StudyMate AI",
      margin,
      y
    );

    y += 12;

    // TOPIC
    pdf.setFontSize(16);

    const topicLines = pdf.splitTextToSize(
      material.topic,
      maxWidth
    );

    pdf.text(
      topicLines,
      margin,
      y
    );

    y += topicLines.length * 8 + 5;

    // SUBJECT
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    pdf.text(
      `Subject: ${material.subject}`,
      margin,
      y
    );

    y += 7;

    pdf.text(
      `Type: ${material.material_type}`,
      margin,
      y
    );

    y += 7;

    pdf.text(
      `Difficulty: ${material.difficulty}`,
      margin,
      y
    );

    y += 12;

    // LINE
    pdf.line(
      margin,
      y,
      pageWidth - margin,
      y
    );

    y += 10;

    // CONTENT
    pdf.setFontSize(10);

    const contentLines = pdf.splitTextToSize(
      material.content,
      maxWidth
    );

    for (const line of contentLines) {
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(line, margin, y);

      y += 5;
    }

    // DOWNLOAD
    const safeTopic = material.topic
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();

    pdf.save(
      `studymate-${safeTopic}.pdf`
    );
  }


  // LOADING
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">

        <p className="text-slate-400">
          Loading material...
        </p>

      </main>
    );
  }


  // ERROR
  if (error || !material) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">

        <div className="text-center">

          <h1 className="text-2xl font-bold">
            Material not found
          </h1>

          <p className="mt-3 text-slate-400">
            {error}
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>

        </div>

      </main>
    );
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


      {/* CONTENT */}
      <section className="mx-auto max-w-5xl px-6 py-12">

        {/* HEADER */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>

              <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
                {material.material_type}
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                {material.topic}
              </h1>

              <p className="mt-3 text-slate-400">
                {material.subject}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">

                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  {material.difficulty}
                </span>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  {new Date(
                    material.created_at
                  ).toLocaleDateString()}
                </span>

              </div>

            </div>


            {/* ACTIONS */}
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700"
              >
                📄 Download PDF
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-red-500/50 px-5 py-3 font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "🗑️ Delete Material"}
              </button>

            </div>

          </div>

        </div>


        {/* MATERIAL */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <h2 className="mb-6 text-2xl font-bold">
            Study Material
          </h2>

          <div className="whitespace-pre-wrap leading-8 text-slate-300">
            {material.content}
          </div>

        </div>


        {/* BACK */}
        <div className="mt-8">

          <Link
            href="/dashboard"
            className="inline-block rounded-lg border border-slate-700 px-6 py-3 hover:bg-slate-800"
          >
            ← Back to My Materials
          </Link>

        </div>

      </section>

    </main>
  );
}