import { NextResponse } from "next/server";
import { Slide, AspectRatio, ASPECT_RATIO_DIMENSIONS } from "@/types/slide";
import { renderSlideHtml } from "@/lib/export/renderSlideHtml";

/**
 * Small wrapper so we can:
 * - use full `puppeteer` in development (Chrome is installed locally)
 * - use `@sparticuz/chromium` + `puppeteer-core` in production (serverless-safe)
 */
async function getPuppeteer() {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    // Local dev: use bundled Puppeteer which downloads Chrome once on your machine
    const puppeteer = await import("puppeteer");
    return {
      launch: async () =>
        puppeteer.default.launch({
          headless: true,
        }),
    };
  }

  // Production: use @sparticuz/chromium to get a serverless-compatible Chrome binary
  const chromium = await import("@sparticuz/chromium");
  const puppeteerCore = await import("puppeteer-core");

  // `chromium` is a CommonJS-style default export; grab it explicitly for typing.
  const chromiumInstance: any = (chromium as any).default ?? chromium;

  return {
    launch: async () =>
      puppeteerCore.default.launch({
        args: chromiumInstance.args,
        defaultViewport: chromiumInstance.defaultViewport ?? null,
        executablePath: await chromiumInstance.executablePath(),
        headless: chromiumInstance.headless,
      }),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slide, aspectRatio = "9:16", slideIndex, format = "png" }: {
      slide: Slide;
      aspectRatio?: AspectRatio;
      slideIndex?: number;
      format?: "png" | "jpg";
    } = body;

    if (!slide) {
      return NextResponse.json({ error: "Slide data required" }, { status: 400 });
    }

    const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];
    const html = renderSlideHtml(slide, aspectRatio, slideIndex);

    // Launch Puppeteer
    const puppeteer = await getPuppeteer();
    const browser = await puppeteer.launch();

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

      // Capture screenshot
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
