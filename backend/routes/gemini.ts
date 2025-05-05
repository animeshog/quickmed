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

// Helper function to format patient details and symptoms

// Endpoint for potential cause
router.post("/cause", async (req: Request, res: Response) => {
  try {
    const symptoms = req.body.symptoms || [];
    const fileText = req.body.fileText || "";

    if (!symptoms.length) {
      return res.status(400).json({ message: "Symptoms are required" });
    }

    const prompt = `Based on these symptoms: ${symptoms.join(", ")}, provide:

CAUSE:
[Most likely cause]

EXPLANATION:
[Brief explanation of why this might be the cause, 2-3 lines max]`;

    const geminiResponse = await askGemini(prompt, symptoms.join(", "));

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
router.post("/treatment", async (req: Request, res: Response) => {
  try {
    const prompt = `List 3 key treatment steps for these symptoms in bullet points. Keep each point to one line:

• [Step 1]
• [Step 2]
• [Step 3]

Symptoms: ${(req.body.symptoms as string[]).join(", ")}`;

    const geminiResponse = await askGemini(
      prompt,
      (req.body.symptoms as string[]).join(", ")
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
});

// Endpoint for medication suggestions
router.post("/medication", async (req: Request, res: Response) => {
  try {
    const prompt = `Based on these symptoms: ${(
      req.body.symptoms as string[]
    ).join(
      ", "
    )}, provide only essential medication details in this EXACT format:

Medication 1:
- Name: [medicine name]
- Power: [strength in mg/ml]
- Dose: [how many times per day]
- Duration: [for how many days]
<br>
Medication 2:
- Name: [medicine name]
- Power: [strength in mg/ml]
- Dose: [how many times per day]
- Duration: [for how many days]
<br>
Note: List only 2-3 common over-the-counter medications. No descriptions, side effects, or additional information.`;

    const geminiResponse = await askGemini(
      prompt,
      req.body.symptoms.join(", ")
    );

    // Clean and format the response
    const formattedResponse = geminiResponse.replace(
      /Medication \d+:/g,
      "<br>Medication $&"
    );

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
});

// Endpoint for home remedies
router.post("/home-remedies", async (req: Request, res: Response) => {
  try {
    const prompt = `Give 2 simple home remedies for these symptoms. Format as:

1. [Remedy] | [Brief instructions]
2. [Remedy] | [Brief instructions]

Symptoms: ${(req.body.symptoms as string[]).join(", ")}`;

    const geminiResponse = await askGemini(
      prompt,
      (req.body.symptoms as string[]).join(", ")
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
});

// Update the save-history endpoint
router.post("/save-history", async (req: Request, res: Response) => {
  try {
    const { userId, symptoms, results } = req.body;

    if (!userId || !symptoms) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or symptoms",
      });
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
});

router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file received",
        });
      }

      try {
        const fileContent = await processFile(req.file);

        if (fileContent.includes("Failed to process file")) {
          return res.status(400).json({
            success: false,
            message: fileContent,
          });
        }

        const prompt = `Analyze this medical report and provide a clear summary in this format:

KEY FINDINGS:
- List the main findings
- Include any abnormal values
- Note important metrics

RECOMMENDATIONS:
- Suggest follow-up actions
- Note any concerning values
- Provide general health advice

Medical Report Content:
${fileContent}`;

        const geminiResponse = await askGemini(prompt, fileContent);

        return res.status(200).json({
          success: true,
          responseText: geminiResponse,
        });
      } catch (error) {
        console.error("File processing error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to process file",
        });
      }
    } catch (error) {
      console.error("File upload error:", error);
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload file",
      });
    }
  }
);

// Add new endpoint for doctor recommendations
router.post("/doctor-recommendation", async (req: Request, res: Response) => {
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
});

export { router as GeminiRouter };