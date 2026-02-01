import Groq from "groq-sdk";

// Trim the API key in case there are accidental leading/trailing spaces
const groqApiKey = process.env.GROQ_API_KEY?.trim();
const groqModel = process.env.GROQ_MODEL?.trim() || "mixtral-8x7b-32768";

let groq: Groq | null = null;
if (groqApiKey) {
  groq = new Groq({ apiKey: groqApiKey });
} else {
  console.warn("GROQ_API_KEY is not set – chat completions will return a placeholder.");
}

export { groq };

/**
 * Call Groq API with chat messages
 */
export async function callGroqChat(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
): Promise<string> {
  if (!groq) {
    return "[Groq API key not configured – unable to generate a response]";
  }

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: 1024,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "";
    
    // Ensure the content is a valid string (not binary/corrupted data)
    if (typeof content !== "string") {
      console.error("Groq returned non-string content:", typeof content);
      return "[Error: Invalid response format from AI]";
    }
    
    // Check for binary/corrupted content (common corruption patterns)
    if (content.includes("\x00") || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content)) {
      console.error("Groq returned corrupted content");
      return "[Error: Received corrupted response from AI. Please try again.]";
    }
    
    return content;
  } catch (error: any) {
    console.error("Groq API error:", error);

    const errMsg = (error?.message || "").toString().toLowerCase();
    const errCode = error?.error?.code || "";

    // Handle decommissioned-model errors gracefully
    if (errMsg.includes("decommissioned") || errCode === "model_decommissioned") {
      return "[Groq model decommissioned. Set GROQ_MODEL to a supported model and redeploy.]";
    }

    // For other API errors return a friendly fallback instead of throwing
    return "[Groq API error occurred — unable to generate a response right now.]";
  }
}
