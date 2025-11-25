import express from "express";
import { body, validationResult } from "express-validator";
import { Task } from "../models/Task.js";
import { List } from "../models/List.js";
import { Reminder } from "../models/Reminder.js";
import { protect } from "../middleware/auth.js";
import { Op } from "sequelize";
import aiService from "../services/aiService.js";
import notificationService from "../services/notificationService.js";

const router = express.Router();

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const {
      listId,
      priority,
      status,
      date,
      limit = 20,
      offset = 0,
    } = req.query;

    const whereClause = {
      userId: req.user.id,
    };

    // Add filters
    if (listId) whereClause.listId = listId;
    if (priority) whereClause.priority = priority;
    if (status === "completed") whereClause.completed = true;
    if (status === "pending") whereClause.completed = false;
    if (date) {
      whereClause.dueDate = date;
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
      order: [
        ["position", "ASC"],
        ["createdAt", "DESC"],
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get tasks by list
// @route   GET /api/lists/:listId/tasks
// @access  Private
router.get("/lists/:listId/tasks", protect, async (req, res) => {
  try {
    const { listId } = req.params;

    // Verify list belongs to user
    const list = await List.findOne({
      where: {
        id: listId,
        userId: req.user.id,
      },
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        error: "List not found",
      });
    }

    const tasks = await Task.findAll({
      where: { listId },
      order: [
        ["position", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Get tasks by list error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: List,
          as: "list",
          attributes: ["id", "name", "color", "icon"],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
router.post(
  "/",
  protect,
  [
    body("title")
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Title must be between 1 and 255 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters"),
    body("listId").isUUID().withMessage("List ID must be valid UUID"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Priority must be low, medium, high, or urgent"),
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be valid date"),
    body("dueTime")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Due time must be valid time format (HH:MM)"),
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

      const {
        title,
        description,
        listId,
        priority = "medium",
        dueDate,
        dueTime,
      } = req.body;

      // Verify list belongs to user
      const list = await List.findOne({
        where: {
          id: listId,
          userId: req.user.id,
        },
      });

      if (!list) {
        return res.status(404).json({
          success: false,
          error: "List not found",
        });
      }

      // Get next position
      const lastTask = await Task.findOne({
        where: { listId },
        order: [["position", "DESC"]],
      });
      const position = lastTask ? lastTask.position + 1 : 0;

      const task = await Task.create({
        title,
        description,
        listId,
        priority,
        dueDate,
        dueTime,
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
        data: taskWithList,
      });
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Update task
// @route   PUT /api/tasks/:id
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
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Priority must be low, medium, high, or urgent"),
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be valid date"),
    body("dueTime")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Due time must be valid time format (HH:MM)"),
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

      const task = await Task.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: "Task not found",
        });
      }

      const { title, description, priority, dueDate, dueTime } = req.body;
      const updateData = {};

      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority) updateData.priority = priority;
      if (dueDate !== undefined) updateData.dueDate = dueDate;
      if (dueTime !== undefined) updateData.dueTime = dueTime;

      await task.update(updateData);

      // Include list data in response
      const updatedTask = await Task.findByPk(task.id, {
        include: [
          {
            model: List,
            as: "list",
            attributes: ["id", "name", "color", "icon"],
          },
        ],
      });

      res.json({
        success: true,
        data: updatedTask,
      });
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    await task.destroy();

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/complete
// @access  Private
router.patch(
  "/:id/complete",
  protect,
  [body("completed").isBoolean().withMessage("Completed must be boolean")],
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

      const { completed } = req.body;

      const task = await Task.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: "Task not found",
        });
      }

      await task.update({ completed });

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      console.error("Toggle task completion error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Reorder tasks
// @route   PUT /api/tasks/reorder
// @access  Private
router.put(
  "/reorder",
  protect,
  [
    body("listId").isUUID().withMessage("List ID must be valid UUID"),
    body("tasks").isArray().withMessage("Tasks must be an array"),
    body("tasks.*.id").isUUID().withMessage("Task ID must be valid UUID"),
    body("tasks.*.position")
      .isInt({ min: 0 })
      .withMessage("Position must be a non-negative integer"),
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

      const { listId, tasks } = req.body;

      // Verify list belongs to user
      const list = await List.findOne({
        where: {
          id: listId,
          userId: req.user.id,
        },
      });

      if (!list) {
        return res.status(404).json({
          success: false,
          error: "List not found",
        });
      }

      // Update positions
      const updatePromises = tasks.map(({ id, position }) =>
        Task.update(
          { position },
          {
            where: {
              id,
              listId,
              userId: req.user.id,
            },
          }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: "Tasks reordered successfully",
      });
    } catch (error) {
      console.error("Reorder tasks error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Search tasks
// @route   GET /api/tasks/search?q=query
// @access  Private
router.get("/search", protect, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Search query must be at least 2 characters",
      });
    }

    const tasks = await Task.findAll({
      where: {
        userId: req.user.id,
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
        ],
      },
      include: [
        {
          model: List,
          as: "list",
          attributes: ["id", "name", "color", "icon"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Search tasks error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Process text with AI to create tasks
// @route   POST /api/tasks/process-text
// @access  Private
router.post(
  "/process-text",
  protect,
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

// @desc    Create reminder for task
// @route   POST /api/tasks/:id/reminder
// @access  Private
router.post(
  "/:id/reminder",
  protect,
  [
    body("reminderTime")
      .isISO8601()
      .withMessage("Valid reminder time is required"),
    body("reminderType")
      .isIn(["push", "sms", "email", "call"])
      .withMessage("Valid reminder type is required"),
    body("title")
      .isLength({ min: 1, max: 255 })
      .withMessage("Title is required"),
    body("message").isLength({ min: 1 }).withMessage("Message is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const {
        reminderTime,
        reminderType,
        title,
        message,
        metadata = {},
      } = req.body;

      // Verify task belongs to user
      const task = await Task.findOne({
        where: {
          id: id,
          userId: req.user.id,
        },
      });

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const reminder = await Reminder.create({
        taskId: id,
        userId: req.user.id,
        reminderTime: new Date(reminderTime),
        reminderType,
        title,
        message,
        metadata,
      });

      res.status(201).json({
        success: true,
        data: reminder,
        message: "Reminder created successfully",
      });
    } catch (error) {
      console.error("Create reminder error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create reminder",
      });
    }
  }
);

// @desc    Get task reminders
// @route   GET /api/tasks/:id/reminders
// @access  Private
router.get("/:id/reminders", protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify task belongs to user
    const task = await Task.findOne({
      where: {
        id: id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const reminders = await Reminder.findAll({
      where: {
        taskId: id,
        userId: req.user.id,
      },
      order: [["reminderTime", "ASC"]],
    });

    res.json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    console.error("Get reminders error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch reminders",
    });
  }
});

// @desc    Send reminder immediately
// @route   POST /api/tasks/:id/reminder/:reminderId/send
// @access  Private
router.post("/:id/reminder/:reminderId/send", protect, async (req, res) => {
  try {
    const { id, reminderId } = req.params;

    // Verify task belongs to user
    const task = await Task.findOne({
      where: {
        id: id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const reminder = await Reminder.findOne({
      where: {
        id: reminderId,
        taskId: id,
        userId: req.user.id,
      },
    });

    if (!reminder) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    if (reminder.sent) {
      return res.status(400).json({ error: "Reminder already sent" });
    }

    await notificationService.sendReminder(reminder);
    await reminder.update({
      sent: true,
      sentAt: new Date(),
      deliveryStatus: "sent",
    });

    res.json({
      success: true,
      message: "Reminder sent successfully",
    });
  } catch (error) {
    console.error("Send reminder error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send reminder",
    });
  }
});

export default router;
