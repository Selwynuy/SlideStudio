// lib/gemini.ts

export async function callGemini(
  userPrompt: string,
  systemPrompt: string,
  maxTokens: number = 2048  // Keep this at 2048 or higher for safety
) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-1.5-flash",  // Consider updating model name
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate slides");
  }

  const data = await response.json();

  try {
    const text = data?.content?.[0]?.text;
    if (!text) throw new Error("No response text from Gemini");
    
    // Remove any markdown formatting if present
    const jsonText = text.replace(/```json|```/g, "").trim();
    
    // Parse the JSON
    const slides = JSON.parse(jsonText);
    
    // Optional: Validate the structure
    if (!slides.slides || !Array.isArray(slides.slides)) {
      throw new Error("Invalid slide format");
    }
    
    return slides;
  } catch (e: any) {
    console.error("Error parsing JSON from Gemini:", e.message);
    console.error("Raw text received:", data?.content?.[0]?.text);
    throw new Error("Invalid JSON returned from Gemini");
  }
}