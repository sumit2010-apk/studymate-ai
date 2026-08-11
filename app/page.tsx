"use client";

export default function Home() {
  function goToSignup() {
    window.location.href = "/signup";
  }

  function goToLogin() {
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="text-2xl font-bold"
          >
            StudyMate<span className="text-blue-500"> AI</span>
          </button>

          <div className="flex items-center gap-4">

            {/* LOGIN */}
            <button
              onClick={goToLogin}
              type="button"
              className="rounded-lg px-4 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Login
            </button>

            {/* GET STARTED */}
            <button
              onClick={goToSignup}
              type="button"
              className="cursor-pointer rounded-lg bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-700"
            >
              Get Started
            </button>

          </div>
        </div>
      </nav>


      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">

        <div className="mx-auto max-w-4xl">

          <div className="mb-8 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm text-blue-400">
            AI-Powered Study Assistant
          </div>

          <h1 className="text-5xl font-bold leading-tight md:text-6xl">
            Learn smarter.
            <br />

            <span className="text-blue-500">
              Study better.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Generate notes, MCQs, flashcards and mock tests
            from any topic or your own study material using AI.
          </p>


          {/* HERO BUTTONS */}
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

            <button
              onClick={goToSignup}
              type="button"
              className="cursor-pointer rounded-xl bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-700"
            >
              Start Studying
            </button>

            <button
              onClick={goToSignup}
              type="button"
              className="cursor-pointer rounded-xl border border-slate-700 px-8 py-4 font-semibold transition hover:bg-slate-900"
            >
              Upload PDF
            </button>

          </div>

        </div>
      </section>


      {/* FEATURES */}
      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 md:grid-cols-3">

        <Feature
          icon="📚"
          title="AI Notes"
          description="Generate clear and structured notes for any subject or topic."
        />

        <Feature
          icon="❓"
          title="MCQ Generator"
          description="Create practice questions with answers and explanations."
        />

        <Feature
          icon="🧠"
          title="Flashcards"
          description="Turn difficult concepts into easy-to-review flashcards."
        />

        <Feature
          icon="📝"
          title="Mock Tests"
          description="Take timed tests and instantly see your performance."
        />

        <Feature
          icon="📄"
          title="Study From PDF"
          description="Upload your own study material and generate useful resources."
        />

        <Feature
          icon="⬇️"
          title="Download"
          description="Download your generated study material as a PDF."
        />

      </section>


      {/* HOW IT WORKS */}
      <section className="border-t border-slate-800 bg-slate-900/40">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="mb-12 text-center">

            <h2 className="text-3xl font-bold">
              How StudyMate AI Works
            </h2>

            <p className="mt-3 text-slate-400">
              Turn any topic into personalized study material.
            </p>

          </div>


          <div className="grid gap-8 md:grid-cols-4">

            <Step
              number="01"
              title="Choose a Topic"
              description="Enter the subject or topic you want to study."
            />

            <Step
              number="02"
              title="Generate"
              description="Let AI create notes, questions or flashcards."
            />

            <Step
              number="03"
              title="Practice"
              description="Test yourself with quizzes and mock tests."
            />

            <Step
              number="04"
              title="Download"
              description="Save your study material as a PDF."
            />

          </div>

        </div>
      </section>


      {/* FINAL CTA */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">

        <h2 className="text-4xl font-bold">
          Ready to study smarter?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Create your free account and start generating
          personalized study material.
        </p>

        <button
          onClick={goToSignup}
          type="button"
          className="mt-8 cursor-pointer rounded-xl bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-700"
        >
          Create Free Account
        </button>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-8">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 md:flex-row">

          <p>
            © 2026 StudyMate AI
          </p>

          <div className="flex gap-6">

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="hover:text-white"
            >
              Home
            </button>

            <button
              onClick={goToSignup}
              className="hover:text-white"
            >
              Sign Up
            </button>

            <button
              onClick={goToLogin}
              className="hover:text-white"
            >
              Login
            </button>

          </div>

        </div>

      </footer>

    </main>
  );
}


/* FEATURE COMPONENT */

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 transition duration-300 hover:-translate-y-1 hover:border-slate-700">

      <div className="mb-5 text-4xl">
        {icon}
      </div>

      <h3 className="mb-3 text-xl font-semibold">
        {title}
      </h3>

      <p className="leading-7 text-slate-400">
        {description}
      </p>

    </div>
  );
}


/* STEP COMPONENT */

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600/10 text-lg font-bold text-blue-400">
        {number}
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 leading-6 text-slate-400">
        {description}
      </p>

    </div>
  );
}