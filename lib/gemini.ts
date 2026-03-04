// lib/gemini.ts

/** Shape of a raw slide returned by the Gemini response before merging defaults */
export interface GeminiRawSlide {
  id?: string;
  type?: "normal" | "hook";
  title?: string;
  description?: string;
}

/** Parsed response from callGemini */
export interface GeminiSlidesResponse {
  slides: GeminiRawSlide[];
}

/**
 * Fetch raw JSON from the Gemini proxy and parse it.
 * Shared by both `callGemini` and `callGeminiField`.
 */
async function fetchAndParseJson(
  userPrompt: string,
  systemPrompt: string,
  maxTokens: number
): Promise<unknown> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemini-1.5-flash",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data: unknown = await response.json();

  const text =
    data != null &&
    typeof data === "object" &&
    "content" in data &&
    Array.isArray((data as { content: unknown[] }).content) &&
    typeof (data as { content: { text?: unknown }[] }).content[0]?.text === "string"
      ? ((data as { content: { text: string }[] }).content[0].text)
      : null;

  if (!text) throw new Error("No response text from Gemini");

  const jsonText = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(jsonText);
  } catch {
    console.error("Gemini returned non-JSON:", jsonText.slice(0, 200));
    throw new Error("Invalid JSON returned from Gemini");
  }
}

/**
 * Call the `/api/generate` proxy, parse the JSON, and validate the response.
 * Throws a typed Error on any failure so callers can handle it without casting.
 */
export async function callGemini(
  userPrompt: string,
  systemPrompt: string,
  maxTokens = 2048
): Promise<GeminiSlidesResponse> {
  const parsed = await fetchAndParseJson(userPrompt, systemPrompt, maxTokens);

  if (
    parsed == null ||
    typeof parsed !== "object" ||
    !("slides" in parsed) ||
    !Array.isArray((parsed as { slides: unknown }).slides)
  ) {
    throw new Error("Invalid slide format: missing `slides` array");
  }

  return parsed as GeminiSlidesResponse;
}

/**
 * Variant for single-field regen calls that return `{"title":"..."}` or
 * `{"description":"..."}` rather than a full slides array.
 */
export async function callGeminiField(
  userPrompt: string,
  systemPrompt: string,
  maxTokens = 400
): Promise<Record<string, string>> {
  const parsed = await fetchAndParseJson(userPrompt, systemPrompt, maxTokens);

  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid field response from Gemini");
  }

  return parsed as Record<string, string>;
}
