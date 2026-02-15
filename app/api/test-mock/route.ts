import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "Forensic Logging Active",
    message:
      "AI generation now uses real AI with comprehensive logging. Check server console for detailed debugging information.",
    note: "Mock responses removed - all generations use Google Gemini AI with strict validation",
  });
}
