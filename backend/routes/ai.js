import express from "express";
import { body, validationResult } from "express-validator";
import { protect } from "../middleware/auth.js";
import {
  parseTaskFromText,
  translateText,
  generateTaskSuggestions,
  analyzePriority,
} from "../services/aiService.js";
import { Task } from "../models/Task.js";
import { List } from "../models/List.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// @desc    Parse task from natural language
// @route   POST /api/ai/parse
// @access  Private
router.post(
  "/parse",
  protect,
  [
    body("text")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Text must be between 1 and 1000 characters"),
    body("language")
      .optional()
      .isIn(["he", "en"])
      .withMessage("Language must be he or en"),
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

      const { text, language = "he" } = req.body;

      const parsedTask = await parseTaskFromText(text, language);

      res.json({
        success: true,
        data: parsedTask,
      });
    } catch (error) {
      logger.error("AI parse error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to parse task",
      });
    }
  }
);

// @desc    Parse and create task
// @route   POST /api/ai/parse-and-create
// @access  Private
router.post(
  "/parse-and-create",
  protect,
  [
    body("text")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Text must be between 1 and 1000 characters"),
    body("language")
      .optional()
      .isIn(["he", "en"])
      .withMessage("Language must be he or en"),
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

      const { text, language = "he" } = req.body;

      // Parse the task
      const parsedTask = await parseTaskFromText(text, language);

      // Find or create appropriate list
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

      // Create the task
      const lastTask = await Task.findOne({
        where: { listId: list.id },
        order: [["position", "DESC"]],
      });
      const position = lastTask ? lastTask.position + 1 : 0;

      const task = await Task.create({
        title: parsedTask.title,
        description: parsedTask.description,
        listId: list.id,
        priority: parsedTask.priority || "medium",
        dueDate: parsedTask.dueDate,
        dueTime: parsedTask.dueTime,
        position,
        userId: req.user.id,
      });

      // Include list data in response
      const taskWithList = await Task.findByPk(task.id, {
        include: [
          {
            model: List,
            as: "list",
            attributes: ["id", "name", "color", "icon"],
          },
        ],
      });

      res.status(201).json({
        success: true,
        data: {
          task: taskWithList,
          parsedData: parsedTask,
        },
      });
    } catch (error) {
      logger.error("AI parse and create error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to parse and create task",
      });
    }
  }
);

// @desc    Translate text
// @route   POST /api/ai/translate
// @access  Private
router.post(
  "/translate",
  protect,
  [
    body("text")
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage("Text must be between 1 and 5000 characters"),
    body("from")
      .isIn(["he", "en", "ar", "es", "fr"])
      .withMessage("Invalid source language"),
    body("to")
      .isIn(["he", "en", "ar", "es", "fr"])
      .withMessage("Invalid target language"),
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

      const { text, from, to } = req.body;

      const translated = await translateText(text, from, to);

      res.json({
        success: true,
        data: {
          original: text,
          translated,
          from,
          to,
        },
      });
    } catch (error) {
      logger.error("AI translate error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to translate text",
      });
    }
  }
);

// @desc    Get task suggestions
// @route   GET /api/ai/suggestions
// @access  Private
router.get("/suggestions", protect, async (req, res) => {
  try {
    const { language = "he" } = req.query;

    // Get user's recent tasks
    const recentTasks = await Task.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    const suggestions = await generateTaskSuggestions(recentTasks, language);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error("AI suggestions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate suggestions",
    });
  }
});

// @desc    Analyze task priority
// @route   POST /api/ai/analyze-priority
// @access  Private
router.post(
  "/analyze-priority",
  protect,
  [
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
    body("description").optional().trim(),
    body("dueDate").optional().isISO8601(),
    body("dueTime").optional(),
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

      const task = req.body;
      const priority = await analyzePriority(task);

      res.json({
        success: true,
        data: { priority },
      });
    } catch (error) {
      logger.error("AI analyze priority error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to analyze priority",
      });
    }
  }
);

export default router;
