import { Router } from "express";
import askGemini from "../controllers/geminiControllers";

const router = Router();

// Single endpoint for medication recommendations
router.post("/recommend", async (req, res) => {
  try {
    const { symptoms } = req.body;

    const prompt = `Based on these symptoms: ${symptoms.join(", ")}, provide:
1. List of recommended medications with dosages
2. Potential side effects for each medication
3. Usage instructions and precautions

Format the response as:
MEDICATION 1:
- Name | Dosage
- Side Effects
- Instructions

MEDICATION 2:
- Name | Dosage
- Side Effects
- Instructions`;

    const geminiResponse = await askGemini(prompt, symptoms.join(", "));

    res.status(200).json({
      success: true,
      responseText: geminiResponse,
    });
  } catch (error) {
    console.error("Medication recommendation error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get medication recommendations",
    });
  }
});

export { router as medicationsRouter };
