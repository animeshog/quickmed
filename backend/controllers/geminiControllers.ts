import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

export default async function askGemini(
  query: string,
  params: string,
  conversationHistory?: ChatMessage[]
): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured in environment variables"
    );
  }

  try {
    const systemInstructions: string[] = [];
    const contents: GeminiContent[] = [];

    if (conversationHistory && conversationHistory.length > 0) {
      for (const message of conversationHistory) {
        if (message.role === "system") {
          systemInstructions.push(message.content);
          continue;
        }
        contents.push({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: `${query}\n${params}` }],
    });

    const response = await axios.post(
      `${BASE_URL}/models/${MODEL}:generateContent`,
      {
        contents,
        ...(systemInstructions.length > 0
          ? {
              systemInstruction: {
                parts: [{ text: systemInstructions.join("\n") }],
              },
            }
          : {}),
      },
      {
        headers: {
          "x-goog-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const parts: GeminiPart[] | undefined =
      response.data?.candidates?.[0]?.content?.parts;

    const output = parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim();

    if (!output) {
      throw new Error("Invalid response format from Gemini API");
    }

    return output;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.error("Gemini Axios error:", status, data);
      const errorMessage =
        data?.error?.message || data?.message || JSON.stringify(data) || error.message || "Unknown error";
      throw new Error(`Gemini API Error: ${errorMessage}`);
    }
    console.error("Gemini non-Axios error:", error);
    throw error;
  }
}
