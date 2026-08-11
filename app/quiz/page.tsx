"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Question = {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
};

export default function QuizPage() {
  const supabase = createClient();

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [score, setScore] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  async function generateQuiz() {
    setError("");
    setSaveMessage("");
    setQuestions([]);
    setAnswers({});
    setScore(null);

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

          topic: `
Create exactly 10 multiple-choice questions about:

${topic}

Return ONLY valid JSON in this exact format:

[
  {
    "question": "Question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": "The exact correct option text",
    "explanation": "Short explanation"
  }
]

Do not include markdown.
Do not include code fences.
Do not include anything before or after the JSON.
          `,

          type: "mcqs",

          difficulty: "intermediate",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate quiz."
        );
      }

      let parsedQuestions: Question[];

      try {
        parsedQuestions = JSON.parse(data.result);
      } catch {
        const cleaned = data.result
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        parsedQuestions = JSON.parse(cleaned);
      }

      if (
        !Array.isArray(parsedQuestions) ||
        parsedQuestions.length === 0
      ) {
        throw new Error("AI returned an invalid quiz.");
      }

      setQuestions(parsedQuestions);

    } catch (err) {
      console.error("Quiz generation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate quiz."
      );
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(
    questionIndex: number,
    answer: string
  ) {
    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: answer,
    }));
  }

  async function submitQuiz() {
    let calculatedScore = 0;

    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);

    // Save quiz result
    setSaving(true);
    setSaveMessage("");
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Quiz completed, but you must be logged in to save the result."
        );
      }

      const { error: insertError } = await supabase
        .from("quiz_results")
        .insert({
          user_id: user.id,
          subject,
          topic,
          score: calculatedScore,
          total_questions: questions.length,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSaveMessage("Quiz result saved successfully! ✅");

    } catch (err) {
      console.error("Quiz save error:", err);

      setSaveMessage(
        err instanceof Error
          ? err.message
          : "Quiz completed, but result could not be saved."
      );
    } finally {
      setSaving(false);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function retryQuiz() {
    setAnswers({});
    setScore(null);
    setSaveMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

      <section className="mx-auto max-w-4xl px-6 py-12">

        <div className="mb-10">

          <h1 className="text-4xl font-bold">
            AI Quiz
          </h1>

          <p className="mt-3 text-slate-400">
            Generate an interactive quiz and test your knowledge.
          </p>

        </div>


        {/* QUIZ SETUP */}

        {questions.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

            <div className="mb-6">

              <label className="mb-2 block font-medium">
                Subject
              </label>

              <input
                type="text"
                value={subject}
                onChange={(e) =>
                  setSubject(e.target.value)
                }
                placeholder="Example: Computer Science"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>


            <div>

              <label className="mb-2 block font-medium">
                Topic
              </label>

              <input
                type="text"
                value={topic}
                onChange={(e) =>
                  setTopic(e.target.value)
                }
                placeholder="Example: Operating Systems"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>


            {error && (
              <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                {error}
              </div>
            )}


            <button
              type="button"
              onClick={generateQuiz}
              disabled={loading}
              className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "🤖 Generating Quiz..."
                : "✨ Generate Quiz"}
            </button>

          </div>
        )}


        {/* SCORE */}

        {score !== null && (
          <div className="mb-8 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-8 text-center">

            <div className="text-5xl">
              🎉
            </div>

            <h2 className="mt-4 text-3xl font-bold">
              Quiz Complete!
            </h2>

            <p className="mt-3 text-xl text-slate-300">
              You scored{" "}
              <span className="font-bold text-blue-400">
                {score}/{questions.length}
              </span>
            </p>

            <p className="mt-2 text-slate-400">

              {score === questions.length
                ? "Perfect score! Excellent work! 🏆"
                : score >= questions.length * 0.7
                ? "Great job! Keep practicing! 💪"
                : "Keep learning and try again! 📚"}

            </p>


            {/* SAVE STATUS */}

            {saving && (
              <p className="mt-4 text-sm text-slate-400">
                Saving your result...
              </p>
            )}

            {saveMessage && (
              <p className="mt-4 text-sm text-green-400">
                {saveMessage}
              </p>
            )}


            <button
              type="button"
              onClick={retryQuiz}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-700"
            >
              🔄 Retry Quiz
            </button>

          </div>
        )}


        {/* QUESTIONS */}

        {questions.length > 0 && (
          <div className="space-y-6">

            {questions.map(
              (question, questionIndex) => {

                const selected =
                  answers[questionIndex];

                const isCorrect =
                  selected === question.answer;

                return (
                  <div
                    key={questionIndex}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                  >

                    {/* QUESTION */}

                    <div className="flex gap-3">

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
                        {questionIndex + 1}
                      </span>

                      <h2 className="text-lg font-semibold leading-7">
                        {question.question}
                      </h2>

                    </div>


                    {/* OPTIONS */}

                    <div className="mt-6 space-y-3">

                      {question.options.map(
                        (option, optionIndex) => {

                          const selectedOption =
                            selected === option;

                          const correctOption =
                            question.answer === option;

                          let optionClass =
                            "border-slate-700 hover:border-blue-500 hover:bg-slate-800";

                          if (
                            score !== null &&
                            correctOption
                          ) {
                            optionClass =
                              "border-green-500 bg-green-500/10 text-green-400";
                          } else if (
                            score !== null &&
                            selectedOption &&
                            !isCorrect
                          ) {
                            optionClass =
                              "border-red-500 bg-red-500/10 text-red-400";
                          } else if (
                            selectedOption
                          ) {
                            optionClass =
                              "border-blue-500 bg-blue-500/10 text-blue-400";
                          }

                          return (
                            <button
                              key={optionIndex}
                              type="button"
                              disabled={score !== null}
                              onClick={() =>
                                selectAnswer(
                                  questionIndex,
                                  option
                                )
                              }
                              className={`w-full rounded-lg border p-4 text-left transition ${optionClass}`}
                            >

                              <span className="mr-3 font-semibold">
                                {String.fromCharCode(
                                  65 + optionIndex
                                )}
                                .
                              </span>

                              {option}

                            </button>
                          );

                        }
                      )}

                    </div>


                    {/* EXPLANATION */}

                    {score !== null &&
                      question.explanation && (
                        <div className="mt-5 rounded-lg bg-slate-950 p-4">

                          <p className="font-medium text-blue-400">
                            Explanation
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {question.explanation}
                          </p>

                        </div>
                      )}

                  </div>
                );
              }
            )}


            {/* SUBMIT */}

            {score === null && (
              <button
                type="button"
                onClick={submitQuiz}
                disabled={
                  Object.keys(answers).length !==
                  questions.length
                }
                className="w-full rounded-lg bg-green-600 px-6 py-4 font-semibold hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Object.keys(answers).length !==
                questions.length
                  ? `Answer all questions (${Object.keys(
                      answers
                    ).length}/${questions.length})`
                  : "🎯 Submit Quiz"}
              </button>
            )}

          </div>
        )}

      </section>

    </main>
  );
}