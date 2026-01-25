import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Call Groq API with chat messages
 */
export async function callGroqChat(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
) {
  try {
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: 1024,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq API error:", error);
    throw error;
  }
}
