import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import {
  transcribeAudio,
  processVoiceRecording,
} from "../services/voiceService.js";
import { parseTaskFromText } from "../services/aiService.js";
import { Task } from "../models/Task.js";
import { List } from "../models/List.js";
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
    const allowedTypes = [
      "audio/webm",
      "audio/mp4",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."));
    }
  },
});

// @desc    Transcribe audio to text
// @route   POST /api/voice/transcribe
// @access  Private
router.post(
  "/transcribe",
  protect,
  upload.single("audio"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No audio file provided",
        });
      }

      const { language = "he" } = req.body;

      const text = await transcribeAudio(req.file.buffer, language);

      res.json({
        success: true,
        data: {
          text,
          language,
        },
      });
    } catch (error) {
      logger.error("Transcribe error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to transcribe audio",
      });
    }
  }
);

// @desc    Process voice recording (transcribe + parse + create task)
// @route   POST /api/voice/process
// @access  Private
router.post("/process", protect, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No audio file provided",
      });
    }

    const { language = "he", autoCreate = true } = req.body;

    // Step 1: Process voice recording (transcribe + webhook)
    const voiceResult = await processVoiceRecording(req.file.buffer, {
      userId: req.user.id,
      language,
    });

    const text = voiceResult.text;

    // Step 2: Parse task from text
    const parsedTask = await parseTaskFromText(text, language);

    let createdTask = null;

    if (autoCreate === "true" || autoCreate === true) {
      // Step 3: Find or create appropriate list
      let list;
      const listMap = {
        shopping: {
          name: language === "he" ? "קניות" : "Shopping",
          icon: "mdi-cart",
          color: "#4CAF50",
        },
        call: {
          name: language === "he" ? "שיחות טלפון" : "Phone Calls",
          icon: "mdi-phone",
          color: "#2196F3",
        },
        meeting: {
          name: language === "he" ? "פגישות" : "Meetings",
          icon: "mdi-calendar",
          color: "#9C27B0",
        },
        doctor: {
          name: language === "he" ? "תורים לרופאים" : "Doctor Appointments",
          icon: "mdi-hospital",
          color: "#F44336",
        },
        repair: {
          name: language === "he" ? "תיקונים" : "Repairs",
          icon: "mdi-wrench",
          color: "#FF9800",
        },
        general: {
          name: language === "he" ? "משימות כלליות" : "General Tasks",
          icon: "mdi-check-circle",
          color: "#607D8B",
        },
      };

      const listConfig = listMap[parsedTask.type] || listMap.general;

      list = await List.findOne({
        where: {
          userId: req.user.id,
          name: listConfig.name,
        },
      });

      if (!list) {
        const lastList = await List.findOne({
          where: { userId: req.user.id },
          order: [["position", "DESC"]],
        });
        const position = lastList ? lastList.position + 1 : 0;

        list = await List.create({
          name: listConfig.name,
          icon: listConfig.icon,
          color: listConfig.color,
          position,
          userId: req.user.id,
        });
      }

      // Step 4: Create the task
      const lastTask = await Task.findOne({
        where: { listId: list.id },
        order: [["position", "DESC"]],
      });
      const position = lastTask ? lastTask.position + 1 : 0;

      createdTask = await Task.create({
        title: parsedTask.title,
        description: parsedTask.description,
        listId: list.id,
        priority: parsedTask.priority || "medium",
        dueDate: parsedTask.dueDate,
        dueTime: parsedTask.dueTime,
        position,
        userId: req.user.id,
      });

      // Include list data
      createdTask = await Task.findByPk(createdTask.id, {
        include: [
          {
            model: List,
            as: "list",
            attributes: ["id", "name", "color", "icon"],
          },
        ],
      });
    }

    res.json({
      success: true,
      data: {
        transcription: text,
        parsedTask,
        createdTask,
        webhookResult: voiceResult.webhookResult,
      },
    });
  } catch (error) {
    logger.error("Process voice error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process voice recording",
    });
  }
});

// @desc    Upload audio file for later processing
// @route   POST /api/voice/upload
// @access  Private
router.post("/upload", protect, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No audio file provided",
      });
    }

    const filename = `${req.user.id}_${Date.now()}.webm`;
    const metadata = {
      userId: req.user.id,
      filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
    };

    // Here you could save to cloud storage (S3, Google Cloud Storage, etc.)
    // For now, we'll just return the metadata

    res.json({
      success: true,
      data: {
        ...metadata,
        message:
          "Audio uploaded successfully. Use /process endpoint to transcribe and create task.",
      },
    });
  } catch (error) {
    logger.error("Upload audio error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload audio",
    });
  }
});

export default router;
