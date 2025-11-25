import express from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put(
  "/profile",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("language")
      .optional()
      .isIn(["he", "en"])
      .withMessage("Language must be he or en"),
    body("theme")
      .optional()
      .isIn(["light", "dark"])
      .withMessage("Theme must be light or dark"),
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

      const { name, language, theme, settings } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (language) updateData.language = language;
      if (theme) updateData.theme = theme;
      if (settings) updateData.settings = settings;

      await User.update(updateData, {
        where: { id: req.user.id },
      });

      const updatedUser = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password", "refreshToken"] },
      });

      res.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      logger.error("Update user profile error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put(
  "/change-password",
  protect,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
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

      const { currentPassword, newPassword } = req.body;

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: "Current password is incorrect",
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      logger.error("Change password error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete("/account", protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    logger.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
