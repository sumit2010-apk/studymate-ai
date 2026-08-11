import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      subject,
      topic,
      type,
      difficulty,
    } = body;

    // Validate input
    if (!subject || !topic || !type || !difficulty) {
      return NextResponse.json(
        {
          error: "Please provide subject, topic, type, and difficulty.",
        },
        {
          status: 400,
        }
      );
    }

    // Check API key
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is missing.");

      return NextResponse.json(
        {
          error: "OpenRouter API key is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    let instruction = "";

    // NOTES
    if (type === "notes") {
      instruction = `
Create detailed but easy-to-understand study notes.

Include:
1. Introduction
2. Important concepts
3. Key points
4. Examples
5. Important terms
6. Quick revision section

Use clear headings and bullet points.
Make the explanation suitable for a student.
`;
    }

    // MCQs
    if (type === "mcqs") {
      instruction = `
Create 10 multiple-choice questions.

For every question include:
- Question
- Four options labeled A, B, C, D
- Correct answer
- Short explanation

Make the questions appropriate for the requested difficulty.
`;
    }

    // FLASHCARDS
    if (type === "flashcards") {
      instruction = `
Create 15 study flashcards.

Use this format:

Flashcard 1
Question:
Answer:

Flashcard 2
Question:
Answer:

Keep answers concise and useful.
`;
    }

    // SUMMARY
    if (type === "summary") {
      instruction = `
Create a concise but complete summary.

Include:
- Main concepts
- Important definitions
- Key points
- Important examples
- Quick revision points
`;
    }

    const prompt = `
You are StudyMate AI, an educational study assistant.

Subject:
${subject}

Topic:
${topic}

Difficulty:
${difficulty}

Material Type:
${type}

${instruction}

Important requirements:
- Be educational and accurate.
- Use simple language where possible.
- Organize the answer clearly.
- Do not mention that you are an AI.
- Do not include unnecessary disclaimers.
`;

    // Call OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "StudyMate AI",
        },

        body: JSON.stringify({
          model: "openrouter/free",

          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    // OpenRouter error
    if (!response.ok) {
      console.error("OpenRouter error:", data);

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "OpenRouter failed to generate content.",
        },
        {
          status: response.status,
        }
      );
    }

    // Get generated text
    const result =
      data?.choices?.[0]?.message?.content;

    if (!result) {
      console.error("Unexpected OpenRouter response:", data);

      return NextResponse.json(
        {
          error: "No content was returned by the AI model.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      result,
    });

  } catch (error) {
    console.error("AI generation error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while generating material.",
      },
      {
        status: 500,
      }
    );
  }
}