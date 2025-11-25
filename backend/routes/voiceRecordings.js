import express from "express";
import { body, validationResult } from "express-validator";
import { VoiceRecording } from "../models/VoiceRecording.js";
import { protect } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Op } from "sequelize";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/voice"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `voice-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /audio\/(mp3|wav|m4a|aac|ogg|webm)/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

// @desc    Get all voice recordings for user
// @route   GET /api/voice-recordings
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { limit = 20, offset = 0, search, archived = false } = req.query;

    const whereClause = {
      userId: req.user.id,
      isArchived: archived === "true",
    };

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { transcription: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const recordings = await VoiceRecording.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: recordings,
    });
  } catch (error) {
    logger.error("Get voice recordings error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get single voice recording
// @route   GET /api/voice-recordings/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const recording = await VoiceRecording.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: "Voice recording not found",
      });
    }

    res.json({
      success: true,
      data: recording,
    });
  } catch (error) {
    logger.error("Get voice recording error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Create new voice recording
// @route   POST /api/voice-recordings
// @access  Private
router.post(
  "/",
  protect,
  upload.single("audio"),
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Title must be between 1 and 255 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters"),
    body("language")
      .optional()
      .isIn(["he", "en", "auto"])
      .withMessage("Language must be he, en, or auto"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Audio file is required",
        });
      }

      const { title, description, language = "auto", tags = [] } = req.body;

      const recording = await VoiceRecording.create({
        title: title || `Recording ${new Date().toLocaleDateString()}`,
        description,
        audioUrl: `/uploads/voice/${req.file.filename}`,
        duration: req.body.duration || 0,
        fileSize: req.file.size,
        language,
        tags: Array.isArray(tags) ? tags : [],
        userId: req.user.id,
      });

      res.status(201).json({
        success: true,
        data: recording,
      });
    } catch (error) {
      logger.error("Create voice recording error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Update voice recording
// @route   PUT /api/voice-recordings/:id
// @access  Private
router.put(
  "/:id",
  protect,
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Title must be between 1 and 255 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters"),
    body("transcription")
      .optional()
      .trim()
      .isLength({ max: 10000 })
      .withMessage("Transcription must be less than 10000 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const recording = await VoiceRecording.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!recording) {
        return res.status(404).json({
          success: false,
          error: "Voice recording not found",
        });
      }

      const { title, description, transcription, tags } = req.body;
      const updateData = {};

      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (transcription !== undefined) {
        updateData.transcription = transcription;
        updateData.isTranscribed = true;
      }
      if (tags) updateData.tags = Array.isArray(tags) ? tags : [];

      await recording.update(updateData);

      res.json({
        success: true,
        data: recording,
      });
    } catch (error) {
      logger.error("Update voice recording error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Delete voice recording
// @route   DELETE /api/voice-recordings/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const recording = await VoiceRecording.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: "Voice recording not found",
      });
    }

    // Delete the audio file
    const fs = await import("fs");
    const filePath = path.join(__dirname, "..", recording.audioUrl);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      logger.warn("Could not delete audio file:", fileError);
    }

    await recording.destroy();

    res.json({
      success: true,
      message: "Voice recording deleted successfully",
    });
  } catch (error) {
    logger.error("Delete voice recording error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Archive/Unarchive voice recording
// @route   PATCH /api/voice-recordings/:id/archive
// @access  Private
router.patch(
  "/:id/archive",
  protect,
  [body("archived").isBoolean().withMessage("Archived must be boolean")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { archived } = req.body;

      const recording = await VoiceRecording.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!recording) {
        return res.status(404).json({
          success: false,
          error: "Voice recording not found",
        });
      }

      await recording.update({ isArchived: archived });

      res.json({
        success: true,
        data: recording,
      });
    } catch (error) {
      logger.error("Archive voice recording error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Process voice recording (transcription)
// @route   POST /api/voice-recordings/:id/process
// @access  Private
router.post("/:id/process", protect, async (req, res) => {
  try {
    const recording = await VoiceRecording.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: "Voice recording not found",
      });
    }

    // This would integrate with OpenAI Whisper or other transcription service
    // For now, we'll just mark it as processed
    await recording.update({
      isProcessed: true,
      isTranscribed: true,
      transcription: "Transcription will be processed by AI service",
    });

    res.json({
      success: true,
      data: recording,
    });
  } catch (error) {
    logger.error("Process voice recording error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
