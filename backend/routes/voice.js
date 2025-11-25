import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import {
  transcribeAudio,
  processVoiceRecording,
} from "../services/voiceService.js";
import aiService from "../services/aiService.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Configure multer for audio upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"), false);
    }
  },
});

// Upload and process voice recording
router.post("/upload", protect, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const { language = "he", autoCreate = "true" } = req.body;

    logger.info(`Processing voice recording for user ${req.user.id}`);

    // Step 1: Transcribe audio
    const voiceResult = await transcribeAudio(req.file.buffer, language);

    if (!voiceResult.success) {
      return res.status(400).json({
        error: "Failed to transcribe audio",
        details: voiceResult.error,
      });
    }

    const text = voiceResult.text;

    // Step 2: Process text with AI
    const result = await aiService.processText(text, req.user.id, language);

    logger.info(`Voice processing completed for user ${req.user.id}`);

    res.json({
      success: true,
      transcription: text,
      results: result,
      message: "Voice recording processed successfully",
    });
  } catch (error) {
    logger.error("Voice processing error:", error);
    res.status(500).json({
      error: "Failed to process voice recording",
      details: error.message,
    });
  }
});

// Process voice recording (alternative endpoint)
router.post("/process", protect, async (req, res) => {
  try {
    const { audioData, language = "he", autoCreate = "true" } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: "No audio data provided" });
    }

    logger.info(`Processing voice recording for user ${req.user.id}`);

    // Step 1: Process voice recording
    const voiceResult = await processVoiceRecording(audioData, language);

    if (!voiceResult.success) {
      return res.status(400).json({
        error: "Failed to process voice recording",
        details: voiceResult.error,
      });
    }

    const text = voiceResult.text;

    // Step 2: Process text with AI
    const result = await aiService.processText(text, req.user.id, language);

    logger.info(`Voice processing completed for user ${req.user.id}`);

    res.json({
      success: true,
      transcription: text,
      results: result,
      message: "Voice recording processed successfully",
    });
  } catch (error) {
    logger.error("Voice processing error:", error);
    res.status(500).json({
      error: "Failed to process voice recording",
      details: error.message,
    });
  }
});

// Get voice processing status
router.get("/status", protect, async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Voice processing service is running",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Voice status error:", error);
    res.status(500).json({
      error: "Failed to get voice processing status",
      details: error.message,
    });
  }
});

export default router;
