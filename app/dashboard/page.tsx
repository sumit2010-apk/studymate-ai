"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Material = {
  id: string;
  subject: string;
  topic: string;
  material_type: string;
  difficulty: string;
  content: string;
  created_at: string;
};

type QuizResult = {
  id: string;
  subject: string;
  topic: string;
  score: number;
  total_questions: number;
  created_at: string;
};

export default function DashboardPage() {
  const supabase = createClient();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Please login to view your dashboard.");
          setLoading(false);
          return;
        }

        // Load saved study materials
        const {
          data: materialData,
          error: materialError,
        } = await supabase
          .from("materials")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (materialError) {
          throw new Error(materialError.message);
        }

        // Load quiz history
        const {
          data: quizData,
          error: quizError,
        } = await supabase
          .from("quiz_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(10);

        if (quizError) {
          throw new Error(quizError.message);
        }

        setMaterials(materialData || []);
        setQuizResults(quizData || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-2xl font-bold"
          >
            StudyMate
            <span className="text-blue-500"> AI</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Logout
          </button>

        </div>
      </nav>


      {/* DASHBOARD */}
      <section className="mx-auto max-w-7xl px-6 py-12">

        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-bold">
            Welcome to StudyMate AI 👋
          </h1>

          <p className="mt-3 text-slate-400">
            Create personalized study material and improve your learning.
          </p>
        </div>


        {/* FEATURE CARDS */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">

          {/* AI NOTES */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="text-4xl">
              📚
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              AI Notes
            </h2>

            <p className="mt-2 leading-6 text-slate-400">
              Generate detailed and easy-to-understand notes for any topic.
            </p>

            <Link
              href="/generate"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700"
            >
              Generate Notes
            </Link>

          </div>


          {/* QUIZ */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="text-4xl">
              ❓
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              AI Quiz
            </h2>

            <p className="mt-2 leading-6 text-slate-400">
              Generate interactive multiple-choice quizzes and test your knowledge.
            </p>

            <Link
              href="/quiz"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700"
            >
              Create Quiz
            </Link>

          </div>


          {/* PDF */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="text-4xl">
              📄
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Study From PDF
            </h2>

            <p className="mt-2 leading-6 text-slate-400">
              Upload your study material and turn it into useful learning resources.
            </p>

            <Link
              href="/pdf"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700"
            >
              Upload PDF
            </Link>

          </div>

        </div>


        {/* QUIZ HISTORY */}
        <div className="mt-12">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Quiz History
            </h2>

            {quizResults.length > 0 && (
              <span className="text-sm text-slate-400">
                {quizResults.length} recent
              </span>
            )}

          </div>


          {/* QUIZ HISTORY LOADING */}
          {loading && (
            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">

              <p className="text-slate-400">
                Loading quiz history...
              </p>

            </div>
          )}


          {/* QUIZ HISTORY EMPTY */}
          {!loading &&
            !error &&
            quizResults.length === 0 && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">

                <div className="text-5xl">
                  🎯
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                  No quiz attempts yet
                </h3>

                <p className="mt-2 text-slate-400">
                  Take your first AI quiz and your score will appear here.
                </p>

                <Link
                  href="/quiz"
                  className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-700"
                >
                  Take a Quiz
                </Link>

              </div>
            )}


          {/* QUIZ HISTORY LIST */}
          {!loading &&
            !error &&
            quizResults.length > 0 && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">

                {quizResults.map((quiz) => {

                  const percentage = Math.round(
                    (quiz.score / quiz.total_questions) * 100
                  );

                  return (
                    <div
                      key={quiz.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <h3 className="text-lg font-semibold">
                            {quiz.topic}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            {quiz.subject}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-2xl font-bold text-blue-400">
                            {quiz.score}/{quiz.total_questions}
                          </p>

                          <p className="text-xs text-slate-500">
                            {percentage}%
                          </p>

                        </div>

                      </div>


                      <div className="mt-5">

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>


                      <p className="mt-4 text-xs text-slate-500">
                        {new Date(
                          quiz.created_at
                        ).toLocaleString()}
                      </p>

                    </div>
                  );
                })}

              </div>
            )}

        </div>


        {/* RECENT MATERIALS */}
        <div className="mt-12">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Recent Study Materials
            </h2>

            {materials.length > 0 && (
              <span className="text-sm text-slate-400">
                {materials.length} saved
              </span>
            )}

          </div>


          {/* MATERIAL ERROR */}
          {!loading && error && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
              {error}
            </div>
          )}


          {/* MATERIALS EMPTY */}
          {!loading &&
            !error &&
            materials.length === 0 && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">

                <div className="text-5xl">
                  📚
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                  No study materials yet
                </h3>

                <p className="mt-2 text-slate-400">
                  Generate your first study material to see it here.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">

                  <Link
                    href="/generate"
                    className="rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-700"
                  >
                    Create Material
                  </Link>

                  <Link
                    href="/pdf"
                    className="rounded-lg border border-slate-700 px-6 py-3 font-medium hover:bg-slate-800"
                  >
                    Upload PDF
                  </Link>

                </div>

              </div>
            )}


          {/* MATERIAL LIST */}
          {!loading && materials.length > 0 && (
            <div className="mt-5 grid gap-5 md:grid-cols-2">

              {materials.map((material) => (
                <div
                  key={material.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3 className="text-xl font-semibold">
                        {material.topic}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {material.subject}
                      </p>

                    </div>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                      {material.material_type}
                    </span>

                  </div>


                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">

                    <span className="rounded bg-slate-800 px-2 py-1">
                      {material.difficulty}
                    </span>

                    <span className="rounded bg-slate-800 px-2 py-1">
                      {new Date(
                        material.created_at
                      ).toLocaleDateString()}
                    </span>

                  </div>


                  <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {material.content}
                  </p>


                  <Link
                    href={`/materials/${material.id}`}
                    className="mt-5 inline-block rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                  >
                    View Material →
                  </Link>

                </div>
              ))}

            </div>
          )}

        </div>

      </section>

    </main>
  );
}