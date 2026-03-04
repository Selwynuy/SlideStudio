import { NextResponse } from "next/server";
import { getSlideData } from "@/lib/export/slideCache";

/**
 * GET endpoint to retrieve slide data by token.
 * Used by the export page to fetch slide data without URL size limits.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const data = getSlideData(token);
    if (!data) {
      return NextResponse.json({ error: "Token expired or invalid" }, { status: 404 });
    }

    return NextResponse.json({
      slide: data.slide,
      aspectRatio: data.aspectRatio,
      slideIndex: data.slideIndex,
    });
  } catch (error) {
    console.error("Error fetching slide data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
