import { Request, Response, Router } from "express";
import askGemini from "../controllers/geminiControllers";
import multer from "multer";
import { processFile } from "../services/pdfService";
import History from "../models/historySchema";
import { truncateReportForAnalysis } from "../utils/reportContent";

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
    const conversationHistory = req.body.conversationHistory || [];

    if (!symptoms.length) {
      res.status(400).json({ message: "Symptoms are required" });
      return;
    }

    // Build conversation history for AI context
    const aiConversationHistory: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [];
    
    // Add system prompt with context
    aiConversationHistory.push({
      role: 'system',
      content: `You are a medical assistant analyzing symptoms. Patient's initial symptoms: ${symptoms.join(", ")}`
    });

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((item: any) => {
        if (item.role && item.content) {
          const role = item.role === 'user' ? 'user' : 'assistant';
          aiConversationHistory.push({
            role: role,
            content: item.content
          });
        }
      });
    }

    const followUpSection = formatFollowUpAnswers(followUpAnswers);
    const prompt = `Based on the symptoms and conversation history above${followUpAnswers.length ? `\n\nAdditional follow-up answers:\n${followUpSection}` : ''}, provide:

CAUSE:
[Most likely cause]

EXPLANATION:
[Brief explanation of why this might be the cause, 2-3 lines max]`;

    const geminiResponse = await askGemini(
      prompt,
      followUpSection,
      aiConversationHistory
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
      const conversationHistory = req.body.conversationHistory || [];

      // Build conversation history for AI context
      const aiConversationHistory: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [];
      
      // Add system prompt with context
      aiConversationHistory.push({
        role: 'system',
        content: `You are a medical assistant analyzing symptoms. Patient's initial symptoms: ${symptoms.join(", ")}`
      });

      // Add conversation history if provided
      if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.forEach((item: any) => {
          if (item.role && item.content) {
            const role = item.role === 'user' ? 'user' : 'assistant';
            aiConversationHistory.push({
              role: role,
              content: item.content
            });
          }
        });
      }

      const followUpSection = formatFollowUpAnswers(followUpAnswers);

      const prompt = `Based on the symptoms and conversation history above${followUpAnswers.length ? `\n\nAdditional follow-up answers:\n${followUpSection}` : ''}, list 3 key treatment steps in bullet points. Keep each point to one line:

• [Step 1]
• [Step 2]
• [Step 3]`;

      const geminiResponse = await askGemini(
        prompt,
        followUpSection,
        aiConversationHistory
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
      const conversationHistory = req.body.conversationHistory || [];

      // Build conversation history for AI context
      const aiConversationHistory: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [];
      
      // Add system prompt with context
      aiConversationHistory.push({
        role: 'system',
        content: `You are a medical assistant analyzing symptoms. Patient's initial symptoms: ${symptoms.join(", ")}`
      });

      // Add conversation history if provided
      if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.forEach((item: any) => {
          if (item.role && item.content) {
            const role = item.role === 'user' ? 'user' : 'assistant';
            aiConversationHistory.push({
              role: role,
              content: item.content
            });
          }
        });
      }

      const followUpSection = formatFollowUpAnswers(followUpAnswers);

      const prompt = `Based on the symptoms and conversation history above${followUpAnswers.length ? `\n\nAdditional follow-up answers:\n${followUpSection}` : ''}, provide only essential medication details in this EXACT format:

Medication 1:
- Name: [medicine name/salt]
- Brand Name: [brand name, e.g., Cipla D3 60K for Vitamin D3]
- Company: [pharmaceutical company, e.g., Cipla]
- Power: [strength in mg/ml]
- Dose: [how many times per day]
- Duration: [for how many days]

Medication 2:
- Name: [medicine name/salt]
- Brand Name: [brand name]
- Company: [pharmaceutical company]
- Power: [strength in mg/ml]
- Dose: [how many times per day]
- Duration: [for how many days]

Note: List only 2-3 common over-the-counter medications with their popular brand names and companies. No descriptions, side effects, or additional information.`;

      const geminiResponse = await askGemini(
        prompt,
        followUpSection,
        aiConversationHistory
      );

      // Clean and format the response to plain text
      const formattedResponse = geminiResponse
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/Medication \d+:/g, "\n$&")
        .trim();

      console.log('BACKEND API: Raw medication response:', geminiResponse);
      console.log('BACKEND API: Formatted medication response:', formattedResponse);

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
      const conversationHistory = req.body.conversationHistory || [];

      // Build conversation history for AI context
      const aiConversationHistory: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [];
      
      // Add system prompt with context
      aiConversationHistory.push({
        role: 'system',
        content: `You are a medical assistant analyzing symptoms. Patient's initial symptoms: ${symptoms.join(", ")}`
      });

      // Add conversation history if provided
      if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.forEach((item: any) => {
          if (item.role && item.content) {
            const role = item.role === 'user' ? 'user' : 'assistant';
            aiConversationHistory.push({
              role: role,
              content: item.content
            });
          }
        });
      }

      const followUpSection = formatFollowUpAnswers(followUpAnswers);

      const prompt = `Based on the symptoms and conversation history above${followUpAnswers.length ? `\n\nAdditional follow-up answers:\n${followUpSection}` : ''}, give 2 simple home remedies. Format as:

1. [Remedy] | [Brief instructions]
2. [Remedy] | [Brief instructions]`;

      const geminiResponse = await askGemini(
        prompt,
        followUpSection,
        aiConversationHistory
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

// Endpoint for dynamic follow-up question generation
router.post(
  "/follow-up-question",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { symptoms, conversationHistory, currentAnswer, questionCount } = req.body;
      
      if (!symptoms || !Array.isArray(symptoms)) {
        res.status(400).json({ 
          success: false,
          message: "Symptoms are required" 
        });
        return;
      }

      // Build conversation history for AI context
      const aiConversationHistory: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [];
      
      // Add system prompt with context
      aiConversationHistory.push({
        role: 'system',
        content: `You are a medical assistant conducting a symptom assessment. Your goal is to gather the minimum necessary information to understand the patient's condition.

Patient's initial symptoms: ${symptoms.join(", ")}

CRITICAL INSTRUCTIONS:
1. Review the ENTIRE conversation history before generating a question
2. NEVER ask about information already provided by the patient
3. NEVER repeat similar questions or ask the same thing in different words
4. Each question MUST collect NEW medically relevant information not already discussed
5. Ask ONLY if absolutely necessary for a reasonable assessment
6. If sufficient information has been gathered (typically 2-5 questions for simple cases, up to 10 for complex cases), return exactly "ANALYSIS_COMPLETE"
7. Generate specific, relevant questions about: symptom duration, severity, timing, aggravating/alleviating factors, associated symptoms, or relevant medical history
8. Return ONLY the question text or "ANALYSIS_COMPLETE" - no prefixes, labels, or additional text`
      });

      // Add conversation history if provided
      if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.forEach((item: any) => {
          if (item.role && item.content) {
            // Convert frontend format to AI format
            const role = item.role === 'user' ? 'user' : 'assistant';
            aiConversationHistory.push({
              role: role,
              content: item.content
            });
          }
        });
      }

      // Add current answer as a user message if provided
      if (currentAnswer) {
        aiConversationHistory.push({
          role: 'user',
          content: currentAnswer
        });
      }

      const currentQuestionNumber = (questionCount || 0) + 1;
      const maxQuestions = 10;

      // Add instruction for the current turn
      const prompt = `Current question number: ${currentQuestionNumber} of maximum ${maxQuestions}

Think step by step:
- What information do I already have from the conversation history?
- What critical information is still missing for a proper assessment?
- Is this missing information essential, or can I proceed with what I have?
- Generate ONE specific question to fill the most critical gap, OR return "ANALYSIS_COMPLETE" if enough information exists.`;

      const geminiResponse = await askGemini(prompt, '', aiConversationHistory);

      // Check if AI wants to stop questioning
      const cleanedResponse = geminiResponse.trim();
      
      // Hard limit: stop after max questions regardless of AI response
      if (currentQuestionNumber >= maxQuestions || cleanedResponse === "ANALYSIS_COMPLETE" || cleanedResponse === "STOP") {
        res.status(200).json({
          success: true,
          shouldStop: true,
          question: "",
          message: currentQuestionNumber >= maxQuestions 
            ? "Maximum questions reached" 
            : "Assessment complete - sufficient information gathered",
        });
        return;
      }

      // Clean up the question response
      const cleanedQuestion = cleanedResponse
        .replace(/^(Question:|Q:|Follow-up:)/i, '')
        .trim()
        .replace(/[?!.]+$/, '') + '?';

      res.status(200).json({
        success: true,
        shouldStop: false,
        question: cleanedQuestion,
        message: "Follow-up question generated successfully",
      });
    } catch (error) {
      console.error("Follow-up question generation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate follow-up question",
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
      const fileContent = truncateReportForAnalysis(req.body.fileContent || "");
      if (!fileContent) {
        res.status(400).json({ success: false, message: "fileContent is required" });
        return;
      }

      const prompt = `Analyze this medical report and provide a clear, structured output with the following labeled sections. Use these exact headings on their own lines (plain text, no markdown # symbols):

Possible Cause:
- Provide the most likely cause(s) in 1-2 concise lines.

Treatment Plan:
- List 3 brief treatment steps or recommendations (one per line).

Home Care:
- Provide 2 simple home remedies or supportive care tips (one per line).

SUMMARY:
- A 2-3 line plain-language summary of the report's most important points.

Medical Report Content:
${fileContent}`;

      const geminiResponse = await askGemini(prompt, "");

      console.log('BACKEND API: Raw file analysis response:', geminiResponse);

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

// Add new endpoint for medicine guidance from uploaded reports
router.post(
  "/medicine-guidance",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const fileContent = truncateReportForAnalysis(req.body.fileContent || "");
      if (!fileContent) {
        res.status(400).json({ success: false, message: "fileContent is required" });
        return;
      }

      const prompt = `Analyze this medical report and provide medication guidance in this EXACT format:

Medication 1:
- Name: [medicine name/salt]
- Brand Name: [brand name, e.g., Cipla D3 60K for Vitamin D3]
- Company: [pharmaceutical company, e.g., Cipla]
- Power: [strength in mg/ml]
- Dose: [how many times per day]
- Duration: [for how many days]

Medication 2:
- Name: [medicine name/salt]
- Brand Name: [brand name]
- Company: [pharmaceutical company]
- Power: [strength in mg/ml]
- Dose: [how many times per day]
- Duration: [for how many days]

Note: List only 2-3 common medications with their popular brand names and companies. No descriptions, side effects, or additional information.

Medical Report Content:
${fileContent}`;

      const geminiResponse = await askGemini(prompt, "");

      // Clean and format the response to plain text
      const formattedResponse = geminiResponse
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/Medication \d+:/g, "\n$&")
        .trim();

      console.log('BACKEND API: Raw medicine guidance response:', geminiResponse);
      console.log('BACKEND API: Formatted medicine guidance response:', formattedResponse);

      res.status(200).json({
        success: true,
        responseText: formattedResponse,
      });
    } catch (error) {
      console.error("Medicine guidance error:", error);
      const detail =
        error instanceof Error ? error.message : "Failed to get medicine guidance";
      res.status(500).json({
        success: false,
        message: "Failed to get medicine guidance",
        error: process.env.NODE_ENV === "development" ? detail : undefined,
      });
    }
  }
);

export const GeminiRouter = router;
