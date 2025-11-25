import express from "express";
import { body, validationResult } from "express-validator";
import { protect as auth } from "../middleware/auth.js";
import aiService from "../services/aiService.js";

const router = express.Router();

// Process text with AI
router.post(
  "/process-text",
  auth,
  [
    body("text").isLength({ min: 1 }).withMessage("Text is required"),
    body("language")
      .optional()
      .isIn(["he", "en"])
      .withMessage("Valid language is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { text, language = "he" } = req.body;

      const results = await aiService.processText(text, req.user.id, language);

      res.json({
        success: true,
        message: "Text processed successfully",
        results,
      });
    } catch (error) {
      console.error("AI processing error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process text with AI",
      });
    }
  }
);

// Translate text
router.post(
  "/translate",
  auth,
  [
    body("text").isLength({ min: 1 }).withMessage("Text is required"),
    body("fromLang")
      .isIn(["he", "en"])
      .withMessage("Valid source language is required"),
    body("toLang")
      .isIn(["he", "en"])
      .withMessage("Valid target language is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { text, fromLang, toLang } = req.body;

      if (fromLang === toLang) {
        return res.json({
          success: true,
          translatedText: text,
        });
      }

      const translatedText = await aiService.translateText(
        text,
        fromLang,
        toLang
      );

      res.json({
        success: true,
        translatedText,
      });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to translate text",
      });
    }
  }
);

// Get AI processing suggestions
router.get("/suggestions", auth, async (req, res) => {
  try {
    const { type, language = "he" } = req.query;

    const suggestions = {
      he: {
        tasks: [
          "תזכיר לי להתקשר לרופא מחר ב-10:00",
          "לקנות חלב, ביצים ולחם מהסופר",
          "פגישה עם דני ביום רביעי בשעה 3",
          "לתקן את הדלת בחדר השינה",
          "להכין מצגת לעבודה",
        ],
        shopping: [
          "חלב 1 ליטר",
          "ביצים 12 יחידות",
          "לחם שחור 1 כיכר",
          "עגבניות 1 קילו",
          "בננות 2 קילו",
        ],
        appointments: [
          "תור לרופא שיניים ביום שני ב-14:00",
          "פגישה עם עורך הדין ביום שלישי ב-16:30",
          "בדיקה רפואית ביום חמישי ב-09:00",
        ],
      },
      en: {
        tasks: [
          "Remind me to call the doctor tomorrow at 10:00",
          "Buy milk, eggs and bread from the store",
          "Meeting with Danny on Wednesday at 3 PM",
          "Fix the door in the bedroom",
          "Prepare presentation for work",
        ],
        shopping: [
          "Milk 1 liter",
          "Eggs 12 pieces",
          "Black bread 1 loaf",
          "Tomatoes 1 kg",
          "Bananas 2 kg",
        ],
        appointments: [
          "Dentist appointment on Monday at 2:00 PM",
          "Meeting with lawyer on Tuesday at 4:30 PM",
          "Medical checkup on Thursday at 9:00 AM",
        ],
      },
    };

    const languageSuggestions = suggestions[language] || suggestions.en;
    const typeSuggestions = type
      ? languageSuggestions[type]
      : Object.values(languageSuggestions).flat();

    res.json({
      success: true,
      suggestions: typeSuggestions,
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch suggestions",
    });
  }
});

// Get AI processing history
router.get("/history", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // This would typically come from a separate AI processing history table
    // For now, return empty results
    res.json({
      success: true,
      history: [],
      total: 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: 0,
    });
  } catch (error) {
    console.error("Error fetching AI history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch AI history",
    });
  }
});

// Test AI service health
router.get("/health", auth, async (req, res) => {
  try {
    // Simple test to check if AI service is working
    const testText = "Test message for AI service";
    const result = await aiService.processText(testText, req.user.id, "en");

    res.json({
      success: true,
      message: "AI service is healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI service health check failed:", error);
    res.status(500).json({
      success: false,
      error: "AI service is not healthy",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
