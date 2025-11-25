import express from "express";
import { body, validationResult } from "express-validator";
import { Reminder } from "../models/Reminder.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { protect as auth } from "../middleware/auth.js";
import notificationService from "../services/notificationService.js";

const router = express.Router();

// Get all reminders for a user
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, sent, upcoming } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      userId: req.user.id,
    };

    if (type) {
      whereClause.reminderType = type;
    }

    if (sent !== undefined) {
      whereClause.sent = sent === "true";
    }

    if (upcoming === "true") {
      whereClause.reminderTime = {
        [require("sequelize").Op.gte]: new Date(),
      };
    }

    const reminders = await Reminder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Task,
          as: "task",
          include: [
            {
              model: require("../models/List.js").List,
              as: "list",
            },
          ],
        },
      ],
      order: [["reminderTime", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      reminders: reminders.rows,
      total: reminders.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(reminders.count / limit),
    });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
});

// Get a specific reminder
router.get("/:id", auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: Task,
          as: "task",
          include: [
            {
              model: require("../models/List.js").List,
              as: "list",
            },
          ],
        },
      ],
    });

    if (!reminder) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    res.json(reminder);
  } catch (error) {
    console.error("Error fetching reminder:", error);
    res.status(500).json({ error: "Failed to fetch reminder" });
  }
});

// Create a new reminder
router.post(
  "/",
  auth,
  [
    body("taskId").isUUID().withMessage("Valid task ID is required"),
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

      const {
        taskId,
        reminderTime,
        reminderType,
        title,
        message,
        metadata = {},
      } = req.body;

      // Verify task belongs to user
      const task = await Task.findOne({
        where: {
          id: taskId,
          userId: req.user.id,
        },
      });

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const reminder = await Reminder.create({
        taskId,
        userId: req.user.id,
        reminderTime: new Date(reminderTime),
        reminderType,
        title,
        message,
        metadata,
      });

      res.status(201).json(reminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ error: "Failed to create reminder" });
    }
  }
);

// Update a reminder
router.put(
  "/:id",
  auth,
  [
    body("reminderTime")
      .optional()
      .isISO8601()
      .withMessage("Valid reminder time is required"),
    body("reminderType")
      .optional()
      .isIn(["push", "sms", "email", "call"])
      .withMessage("Valid reminder type is required"),
    body("title")
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage("Title is required"),
    body("message")
      .optional()
      .isLength({ min: 1 })
      .withMessage("Message is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const reminder = await Reminder.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!reminder) {
        return res.status(404).json({ error: "Reminder not found" });
      }

      if (reminder.sent) {
        return res.status(400).json({ error: "Cannot update sent reminder" });
      }

      const updatedReminder = await reminder.update(req.body);
      res.json(updatedReminder);
    } catch (error) {
      console.error("Error updating reminder:", error);
      res.status(500).json({ error: "Failed to update reminder" });
    }
  }
);

// Delete a reminder
router.delete("/:id", auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!reminder) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    await reminder.destroy();
    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({ error: "Failed to delete reminder" });
  }
});

// Send reminder immediately
router.post("/:id/send", auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: User,
          as: "user",
        },
      ],
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

    res.json({ message: "Reminder sent successfully" });
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({ error: "Failed to send reminder" });
  }
});

// Get reminder statistics
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await notificationService.getNotificationStats(
      req.user.id,
      start,
      end
    );
    res.json(stats);
  } catch (error) {
    console.error("Error fetching reminder stats:", error);
    res.status(500).json({ error: "Failed to fetch reminder statistics" });
  }
});

export default router;
