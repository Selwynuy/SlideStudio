import { NextRequest, NextResponse } from "next/server";
import { Slide, AspectRatio, ASPECT_RATIO_DIMENSIONS } from "@/types/slide";
import { renderSlideHtml } from "@/lib/export/renderSlideHtml";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

// Vercel: Chromium must run on the Node.js runtime (not Edge).
export const runtime = "nodejs";
// Prevent caching and ensure the handler runs dynamically.
export const dynamic = "force-dynamic";
// Allow enough time for Chromium to download/unpack and render.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slide, aspectRatio = "9:16", slideIndex, format = "png" }: {
      slide: Slide;
      aspectRatio?: AspectRatio;
      slideIndex?: number;
      format?: "png" | "jpg" | "pdf";
    } = body;

    if (!slide) {
      return NextResponse.json({ error: "Slide data required" }, { status: 400 });
    }

    const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];
    const html = renderSlideHtml(slide, aspectRatio, slideIndex);

    // Choose Chromium executable path based on environment:
    // - CHROMIUM_REMOTE_EXEC_PATH: remote tarball URL (recommended for Vercel)
    // - CHROMIUM_LOCAL_EXEC_PATH: local Chrome/Chromium path (for dev)
    const remotePath = process.env.CHROMIUM_REMOTE_EXEC_PATH;
    const localPath = process.env.CHROMIUM_LOCAL_EXEC_PATH;

    if (!remotePath && !localPath) {
      throw new Error(
        "Missing CHROMIUM_REMOTE_EXEC_PATH or CHROMIUM_LOCAL_EXEC_PATH"
      );
    }

    const browser =
      remotePath
        ? await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(remotePath),
            headless: true,
          })
        : await puppeteer.launch({
            executablePath: localPath,
            headless: true,
          });

    try {
      const page = await browser.newPage();
      
      // Set viewport to match slide dimensions
      await page.setViewport({
        width: dims.width,
        height: dims.height,
        deviceScaleFactor: 2, // Retina quality
      });

      // Set HTML content directly - bypasses all routing/auth
      await page.setContent(html, {
        waitUntil: ["networkidle0", "load"],
      });

      // Wait for fonts to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // PDF export
      if (format === "pdf") {
        const pdf = await page.pdf({
          printBackground: true,
          width: `${dims.width}px`,
          height: `${dims.height}px`,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
        });

        await browser.close();

        return new NextResponse(pdf as unknown as BodyInit, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="slide.pdf"`,
          },
        });
      }

      // Image export (png / jpg)
      const screenshot = await page.screenshot({
        type: format === "jpg" ? "jpeg" : "png",
        quality: format === "jpg" ? 90 : undefined,
        clip: {
          x: 0,
          y: 0,
          width: dims.width,
          height: dims.height,
        },
      });

      await browser.close();

      // Return image (screenshot is Buffer/Uint8Array, NextResponse handles it)
      return new NextResponse(screenshot as unknown as BodyInit, {
        headers: {
          "Content-Type": format === "jpg" ? "image/jpeg" : "image/png",
          "Content-Disposition": `attachment; filename="slide.${format}"`,
        },
      });
    } catch (err) {
      await browser.close();
      throw err;
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 }
    );
  }
}
