import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";

export const runtime = "nodejs";

PDFParse.setWorker(getPath());

export async function POST(request: Request) {
  try {
    console.log("=================================");
    console.log("PDF upload started");

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Please upload a PDF file.",
        },
        {
          status: 400,
        }
      );
    }

    console.log("File:", file.name);
    console.log("Type:", file.type);
    console.log("Size:", file.size);

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error: "Only PDF files are supported.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "PDF must be smaller than 10 MB.",
        },
        {
          status: 400,
        }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    console.log("Buffer created:", buffer.length);

    const parser = new PDFParse({
      data: new Uint8Array(buffer),
    });

    const result = await parser.getText();

    await parser.destroy();

    const text = result.text.trim();

    console.log("PDF parsed successfully");
    console.log("Pages:", result.total);
    console.log("Characters:", text.length);

    if (!text) {
      return NextResponse.json(
        {
          error:
            "The PDF contains no readable text. It may be a scanned or image-based PDF.",
        },
        {
          status: 400,
        }
      );
    }

    const limitedText = text.slice(0, 50000);

    return NextResponse.json({
      success: true,
      text: limitedText,
      pages: result.total,
    });

  } catch (error) {
    console.error("=================================");
    console.error("PDF EXTRACTION ERROR");
    console.error(error);
    console.error("=================================");

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process the PDF.",
      },
      {
        status: 500,
      }
    );
  }
}