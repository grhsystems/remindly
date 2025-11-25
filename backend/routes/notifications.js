import express from "express";
import { body, validationResult } from "express-validator";
import { protect } from "../middleware/auth.js";
import {
  sendSMS,
  sendEmail,
  sendPushNotification,
  makeVoiceCall,
  sendTaskReminder,
} from "../services/notificationService.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// @desc    Send SMS notification
// @route   POST /api/notifications/sms
// @access  Private
router.post(
  "/sms",
  protect,
  [
    body("phoneNumber").isMobilePhone().withMessage("Invalid phone number"),
    body("message")
      .trim()
      .isLength({ min: 1, max: 160 })
      .withMessage("Message must be between 1 and 160 characters"),
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

      const { phoneNumber, message } = req.body;

      const result = await sendSMS(phoneNumber, message);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Send SMS error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to send SMS",
      });
    }
  }
);

// @desc    Send Email notification
// @route   POST /api/notifications/email
// @access  Private
router.post(
  "/email",
  protect,
  [
    body("to").isEmail().withMessage("Invalid email address"),
    body("subject")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Subject must be between 1 and 100 characters"),
    body("message")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Message is required"),
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

      const { to, subject, message, html } = req.body;

      const result = await sendEmail(to, subject, message, html);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Send email error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to send email",
      });
    }
  }
);

// @desc    Send Push notification
// @route   POST /api/notifications/push
// @access  Private
router.post(
  "/push",
  protect,
  [
    body("token").trim().notEmpty().withMessage("FCM token is required"),
    body("title")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Title must be between 1 and 100 characters"),
    body("body")
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage("Body must be between 1 and 500 characters"),
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

      const { token, title, body, image, data } = req.body;

      const result = await sendPushNotification(token, {
        title,
        body,
        image,
        data,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Send push error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to send push notification",
      });
    }
  }
);

// @desc    Make Voice call
// @route   POST /api/notifications/call
// @access  Private
router.post(
  "/call",
  protect,
  [
    body("phoneNumber").isMobilePhone().withMessage("Invalid phone number"),
    body("message")
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage("Message must be between 1 and 500 characters"),
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

      const { phoneNumber, message, language = "he" } = req.body;

      const result = await makeVoiceCall(phoneNumber, message, language);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Make call error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to make voice call",
      });
    }
  }
);

// @desc    Send task reminder
// @route   POST /api/notifications/task-reminder/:taskId
// @access  Private
router.post(
  "/task-reminder/:taskId",
  protect,
  [
    body("channels").isArray().withMessage("Channels must be an array"),
    body("channels.*")
      .isIn(["sms", "email", "push", "call"])
      .withMessage("Invalid channel"),
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

      const { taskId } = req.params;
      const { channels } = req.body;

      // Get task
      const task = await Task.findOne({
        where: {
          id: taskId,
          userId: req.user.id,
        },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: "Task not found",
        });
      }

      // Send reminder
      const result = await sendTaskReminder(req.user, task, channels);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Send task reminder error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to send task reminder",
      });
    }
  }
);

// @desc    Update user notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
router.put(
  "/preferences",
  protect,
  [
    body("fcmToken").optional().trim(),
    body("phoneNumber").optional().isMobilePhone(),
    body("emailNotifications").optional().isBoolean(),
    body("smsNotifications").optional().isBoolean(),
    body("pushNotifications").optional().isBoolean(),
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

      const updateData = {};
      const {
        fcmToken,
        phoneNumber,
        emailNotifications,
        smsNotifications,
        pushNotifications,
      } = req.body;

      if (fcmToken !== undefined) updateData.fcmToken = fcmToken;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (emailNotifications !== undefined)
        updateData.emailNotifications = emailNotifications;
      if (smsNotifications !== undefined)
        updateData.smsNotifications = smsNotifications;
      if (pushNotifications !== undefined)
        updateData.pushNotifications = pushNotifications;

      await req.user.update(updateData);

      res.json({
        success: true,
        data: {
          fcmToken: req.user.fcmToken,
          phoneNumber: req.user.phoneNumber,
          emailNotifications: req.user.emailNotifications,
          smsNotifications: req.user.smsNotifications,
          pushNotifications: req.user.pushNotifications,
        },
      });
    } catch (error) {
      logger.error("Update preferences error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update preferences",
      });
    }
  }
);

export default router;
