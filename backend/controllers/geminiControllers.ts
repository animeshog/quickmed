import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
const BASE_URL = "https://api.groq.com/openai";
const MODEL = "llama-3.3-70b-versatile";

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export default async function askGemini(
  query: string,
  params: string,
  conversationHistory?: ChatMessage[]
): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      "GROQ_API_KEY or GEMINI_API_KEY is not configured in environment variables"
    );
  }

  try {
    // Build messages array with conversation history
    const messages: ChatMessage[] = [];
    
    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }
    
    // Add the current query as a user message
    messages.push({
      role: "user",
      content: `${query}\n${params}`
    });

    const response = await axios.post(
      `${BASE_URL}/v1/chat/completions`,
      {
        model: MODEL,
        messages: messages
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(JSON.stringify(response.data, null, 2));
    const output = response.data?.choices?.[0]?.message?.content;

    if (!output) {
      throw new Error("Invalid response format from Groq API");
    }

    if (typeof output === "string") {
      return output;
    }

    if (Array.isArray(output)) {
      return output
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }
          if (item?.content) {
            return item.content
              .map((part: any) => part?.text || "")
              .join("");
          }
          return JSON.stringify(item);
        })
        .join(" ");
    }

    return String(output);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.error("Groq Axios error:", status, data);
      const errorMessage =
        data?.error?.message || data?.message || JSON.stringify(data) || error.message || "Unknown error";
      throw new Error(`Groq API Error: ${errorMessage}`);
    }
    console.error("Groq non-Axios error:", error);
    throw error;
  }
}
