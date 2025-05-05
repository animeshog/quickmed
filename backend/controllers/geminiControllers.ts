import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com";
const API_VERSION = "v1beta";
const MODEL = "gemini-2.0-flash";

export default async function askGemini(
  query: string,
  params: string
): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured in environment variables"
    );
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/${API_VERSION}/models/${MODEL}:generateContent`,
      {
        contents: [
          {
            parts: [
              {
                text: `${query}\n${params}`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: API_KEY,
        },
      }
    );

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response format from Gemini API");
    }

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error?.message || "Unknown error";
      throw new Error(`Gemini API Error: ${errorMessage}`);
    }
    throw error;
  }
}

