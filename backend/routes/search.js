import express from "express";
import { body, validationResult } from "express-validator";
import { Task } from "../models/Task.js";
import { List } from "../models/List.js";
import { protect } from "../middleware/auth.js";
import { Op } from "sequelize";
import { logger } from "../utils/logger.js";

const router = express.Router();

// @desc    Search tasks and lists
// @route   GET /api/search
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { q, type, limit = 20, offset = 0 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Search query must be at least 2 characters",
      });
    }

    const searchQuery = `%${q}%`;
    const whereClause = {
      userId: req.user.id,
      [Op.or]: [
        { title: { [Op.iLike]: searchQuery } },
        { description: { [Op.iLike]: searchQuery } },
      ],
    };

    // Add type filter if specified
    if (type === "tasks") {
      whereClause.id = { [Op.ne]: null }; // This will be handled by Task model
    } else if (type === "lists") {
      // Search lists instead
      const lists = await List.findAll({
        where: {
          userId: req.user.id,
          [Op.or]: [
            { name: { [Op.iLike]: searchQuery } },
            { description: { [Op.iLike]: searchQuery } },
          ],
        },
        include: [
          {
            model: Task,
            as: "tasks",
            attributes: ["id", "title", "completed", "priority"],
          },
        ],
        order: [["name", "ASC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.json({
        success: true,
        data: {
          lists,
          tasks: [],
          total: lists.length,
        },
      });
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        {
          model: List,
          as: "list",
          attributes: ["id", "name", "color", "icon"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        tasks,
        lists: [],
        total: tasks.length,
      },
    });
  } catch (error) {
    logger.error("Search error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Search tasks only
// @route   GET /api/search/tasks
// @access  Private
router.get("/tasks", protect, async (req, res) => {
  try {
    const { q, priority, completed, limit = 20, offset = 0 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Search query must be at least 2 characters",
      });
    }

    const searchQuery = `%${q}%`;
    const whereClause = {
      userId: req.user.id,
      [Op.or]: [
        { title: { [Op.iLike]: searchQuery } },
        { description: { [Op.iLike]: searchQuery } },
      ],
    };

    if (priority) whereClause.priority = priority;
    if (completed !== undefined) whereClause.completed = completed === "true";

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        {
          model: List,
          as: "list",
          attributes: ["id", "name", "color", "icon"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    logger.error("Search tasks error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Search lists only
// @route   GET /api/search/lists
// @access  Private
router.get("/lists", protect, async (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Search query must be at least 2 characters",
      });
    }

    const searchQuery = `%${q}%`;

    const lists = await List.findAll({
      where: {
        userId: req.user.id,
        [Op.or]: [
          { name: { [Op.iLike]: searchQuery } },
          { description: { [Op.iLike]: searchQuery } },
        ],
      },
      include: [
        {
          model: Task,
          as: "tasks",
          attributes: ["id", "title", "completed", "priority"],
        },
      ],
      order: [["name", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: lists,
    });
  } catch (error) {
    logger.error("Search lists error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
