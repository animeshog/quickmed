import { Request, Response, Router } from "express";
import askGemini from "../controllers/geminiControllers";
import multer from "multer";
import { processFile } from "../services/pdfService";
import History from "../models/historySchema";

// Update multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG and PDF files are allowed."
        )
      );
    }
  },
});

const router = Router();

const formatFollowUpAnswers = (answers: string[] = []) => {
  if (!answers.length) return "";
  return `Follow-up answers:\n${answers
    .filter(Boolean)
    .map((answer, index) => `${index + 1}. ${answer}`)
    .join("\n")}\n\n`;
};

// Endpoint for potential cause
router.post("/cause", async (req: Request, res: Response): Promise<void> => {
  try {
    const symptoms = req.body.symptoms || [];
    const followUpAnswers = req.body.followUpAnswers || [];

    if (!symptoms.length) {
      res.status(400).json({ message: "Symptoms are required" });
      return;
    }

    const followUpSection = formatFollowUpAnswers(followUpAnswers);
    const prompt = `Based on these symptoms: ${symptoms.join(", ")}
${followUpSection}provide:

CAUSE:
[Most likely cause]

EXPLANATION:
[Brief explanation of why this might be the cause, 2-3 lines max]`;

    const geminiResponse = await askGemini(
      prompt,
      `${symptoms.join(", ")}${followUpAnswers.length ? `\n\n${followUpSection}` : ""}`
    );

    res.status(200).json({
      responseText: geminiResponse,
      message: "Success",
    });
  } catch (error) {
    console.error("Cause analysis error:", error);
    res.status(500).json({ message: "Failed to analyze cause" });
  }
});

// Endpoint for treatment options
router.post(
  "/treatment",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const symptoms = req.body.symptoms || [];
      const followUpAnswers = req.body.followUpAnswers || [];
      const followUpSection = formatFollowUpAnswers(followUpAnswers);

      const prompt = `List 3 key treatment steps for these symptoms in bullet points. Keep each point to one line:

• [Step 1]
• [Step 2]
• [Step 3]

Symptoms: ${symptoms.join(", ")}
${followUpSection}`;

      const geminiResponse = await askGemini(
        prompt,
        `${symptoms.join(", ")}${followUpAnswers.length ? `\n\n${followUpSection}` : ""}`
      );

      res.status(200).json({
        responseText: geminiResponse,
        message: "Treatment analysis completed successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to analyze treatment options",
      });
    }
  }
);

// Endpoint for medication suggestions
router.post(
  "/medication",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const symptoms = req.body.symptoms || [];
      const followUpAnswers = req.body.followUpAnswers || [];
      const followUpSection = formatFollowUpAnswers(followUpAnswers);

      const prompt = `Based on these symptoms: ${symptoms.join(", ")}
${followUpSection}provide only essential medication details in this EXACT format:

Medication 1:
- Name: [medicine name]
- Power: [strength in mg/ml]
- Dose: [how many times per day]
- Duration: [for how many days]

Medication 2:
- Name: [medicine name]
- Power: [strength in mg/ml]
- Dose: [how many times per day]
- Duration: [for how many days]

Note: List only 2-3 common over-the-counter medications. No descriptions, side effects, or additional information.`;

      const geminiResponse = await askGemini(
        prompt,
        `${symptoms.join(", ")}${followUpAnswers.length ? `\n\n${followUpSection}` : ""}`
      );

      // Clean and format the response to plain text
      const formattedResponse = geminiResponse
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/Medication \d+:/g, "\n$&")
        .trim();

      res.status(200).json({
        responseText: formattedResponse,
        message: "Success",
      });
    } catch (error) {
      console.error("Medication error:", error);
      res.status(500).json({
        message: "Failed to get medication suggestions",
      });
    }
  }
);

// Endpoint for home remedies
router.post(
  "/home-remedies",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const symptoms = req.body.symptoms || [];
      const followUpAnswers = req.body.followUpAnswers || [];
      const followUpSection = formatFollowUpAnswers(followUpAnswers);

      const prompt = `Give 2 simple home remedies for these symptoms. Format as:

1. [Remedy] | [Brief instructions]
2. [Remedy] | [Brief instructions]

Symptoms: ${symptoms.join(", ")}
${followUpSection}`;

      const geminiResponse = await askGemini(
        prompt,
        `${symptoms.join(", ")}${followUpAnswers.length ? `\n\n${followUpSection}` : ""}`
      );

      res.status(200).json({
        responseText: geminiResponse,
        message: "Home remedies analysis completed successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to analyze home remedies",
      });
    }
  }
);

// Update the save-history endpoint
router.post(
  "/save-history",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, symptoms, results } = req.body;

      if (!userId || !symptoms) {
        res.status(400).json({
          success: false,
          message: "Missing userId or symptoms",
        });
        return;
      }

      const history = new History({
        userId,
        symptoms,
        diagnosis: results?.cause || "",
        treatment: results?.treatment || "",
        medications: results?.medication || "",
        homeRemedies: results?.homeRemedies || "",
        fileAnalysis: results?.fileAnalysis || "",
        date: new Date(),
      });

      await history.save();

      res.status(201).json({
        success: true,
        message: "History saved successfully",
      });
    } catch (error) {
      console.error("Save history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save history",
      });
    }
  }
);

// Upload endpoint: extract text from file but DO NOT run AI analysis yet.
// This lets the frontend control when analysis should run.
router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No file received",
        });
        return;
      }

      try {
        const fileContent = await processFile(req.file);

        if (fileContent.includes("Failed to process file")) {
          res.status(400).json({
            success: false,
            message: fileContent,
          });
          return;
        }

        // Return extracted text to frontend but do not call the AI here.
        res.status(200).json({
          success: true,
          fileText: fileContent,
        });
      } catch (error) {
        console.error("File processing error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to process file",
        });
      }
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload file",
      });
    }
  }
);

// Analyze uploaded file text. This endpoint runs the AI analysis on previously
// extracted file text. Separated so frontend can control when analysis runs.
router.post(
  "/analyze-upload",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const fileContent = req.body.fileContent || "";
      if (!fileContent) {
        res.status(400).json({ success: false, message: "fileContent is required" });
        return;
      }

      const prompt = `Analyze this medical report and provide a clear, structured output with the following labeled sections. Use these exact headings on their own lines (plain text, no markdown # symbols):

Possible Cause:
- Provide the most likely cause(s) in 1-2 concise lines.

Treatment Plan:
- List 3 brief treatment steps or recommendations (one per line).

Medication Guidance:
- List 2-3 recommended medications in the format: Name | Dose | Frequency | Duration (no additional notes).

Home Care:
- Provide 2 simple home remedies or supportive care tips (one per line).

SUMMARY:
- A 2-3 line plain-language summary of the report's most important points.

Medical Report Content:
${fileContent}`;

      const geminiResponse = await askGemini(prompt, fileContent);

      res.status(200).json({
        success: true,
        responseText: geminiResponse,
      });
    } catch (error) {
      console.error("Analyze upload error:", error);
      res.status(500).json({ success: false, message: "Failed to analyze uploaded report" });
    }
  }
);

// Add new endpoint for doctor recommendations
router.post(
  "/doctor-recommendation",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { symptoms } = req.body;

      const prompt = `Based on these symptoms: ${symptoms.join(
        ", "
      )}, recommend exactly one most appropriate medical specialist from this list: general-physician, dermatologist, orthopedist, cardiologist, ent-specialist, neurologist, psychiatrist, pediatrician, gynecologist, dentist, ophthalmologist, pulmonologist, gastroenterologist.
NOTE: Return ONLY the specialist name from the list above, without any additional text or explanation.
Do not add words like "doctor" or "specialist" to the name.`;

      const geminiResponse = await askGemini(prompt, symptoms.join(", "));
      // Clean up response to ensure it's just the specialist name
      const specialist = geminiResponse.trim().toLowerCase();

      res.status(200).json({
        responseText: specialist,
        message: "Success",
      });
    } catch (error) {
      console.error("Doctor recommendation error:", error);
      res.status(500).json({
        message: "Failed to get doctor recommendation",
      });
    }
  }
);

export const GeminiRouter = router;
