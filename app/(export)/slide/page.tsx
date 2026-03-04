import { getSlideData } from "@/lib/export/slideCache";
import ExportSlideClient from "./client";

/**
 * Server component for Puppeteer export - no auth required.
 * Fetches slide data server-side, then passes to client component for rendering.
 */
export default async function ExportSlidePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-black text-white">
        No token provided
      </div>
    );
  }

  const data = getSlideData(token);
  if (!data) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-black text-white">
        Token expired or invalid
      </div>
    );
  }

  // Pass data to client component (no fetch needed, already have it server-side)
  return <ExportSlideClient slide={data.slide} aspectRatio={data.aspectRatio} slideIndex={data.slideIndex} />;
}
