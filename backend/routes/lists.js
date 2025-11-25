import express from "express";
import { body, validationResult } from "express-validator";
import { List } from "../models/List.js";
import { Task } from "../models/Task.js";
import { protect } from "../middleware/auth.js";
import { Op } from "sequelize";

const router = express.Router();

// @desc    Get all lists for user
// @route   GET /api/lists
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const lists = await List.findAll({
      where: { userId: req.user.id },
      order: [["position", "ASC"]],
      include: [
        {
          model: Task,
          as: "tasks",
          attributes: ["id", "completed"],
        },
      ],
    });

    // Add task count to each list
    const listsWithCount = lists.map((list) => ({
      ...list.toJSON(),
      taskCount: list.tasks ? list.tasks.length : 0,
      completedCount: list.tasks
        ? list.tasks.filter((task) => task.completed).length
        : 0,
    }));

    res.json({
      success: true,
      data: listsWithCount,
    });
  } catch (error) {
    console.error("Get lists error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get single list
// @route   GET /api/lists/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const list = await List.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: Task,
          as: "tasks",
          order: [["position", "ASC"]],
        },
      ],
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        error: "List not found",
      });
    }

    res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Get list error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Create new list
// @route   POST /api/lists
// @access  Private
router.post(
  "/",
  protect,
  [
    body("name")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Name must be between 1 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    body("icon")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Icon must be less than 50 characters"),
    body("color")
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage("Color must be a valid hex color"),
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
        name,
        description,
        icon = "mdi-format-list-bulleted",
        color = "#1976d2",
      } = req.body;

      // Check if list with same name exists
      const existingList = await List.findOne({
        where: {
          name,
          userId: req.user.id,
        },
      });

      if (existingList) {
        return res.status(400).json({
          success: false,
          error: "List with this name already exists",
        });
      }

      // Get next position
      const lastList = await List.findOne({
        where: { userId: req.user.id },
        order: [["position", "DESC"]],
      });
      const position = lastList ? lastList.position + 1 : 0;

      const list = await List.create({
        name,
        description,
        icon,
        color,
        position,
        userId: req.user.id,
      });

      res.status(201).json({
        success: true,
        data: list,
      });
    } catch (error) {
      console.error("Create list error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Update list
// @route   PUT /api/lists/:id
// @access  Private
router.put(
  "/:id",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Name must be between 1 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    body("icon")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Icon must be less than 50 characters"),
    body("color")
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage("Color must be a valid hex color"),
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

      const list = await List.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!list) {
        return res.status(404).json({
          success: false,
          error: "List not found",
        });
      }

      const { name, description, icon, color } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (icon) updateData.icon = icon;
      if (color) updateData.color = color;

      await list.update(updateData);

      res.json({
        success: true,
        data: list,
      });
    } catch (error) {
      console.error("Update list error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Delete list
// @route   DELETE /api/lists/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const list = await List.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        error: "List not found",
      });
    }

    // Delete all tasks in this list
    await Task.destroy({
      where: { listId: list.id },
    });

    // Delete the list
    await list.destroy();

    res.json({
      success: true,
      message: "List deleted successfully",
    });
  } catch (error) {
    console.error("Delete list error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Reorder lists
// @route   PUT /api/lists/reorder
// @access  Private
router.put(
  "/reorder",
  protect,
  [
    body("lists").isArray().withMessage("Lists must be an array"),
    body("lists.*.id").isUUID().withMessage("List ID must be valid UUID"),
    body("lists.*.position")
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

      const { lists } = req.body;

      // Update positions
      const updatePromises = lists.map(({ id, position }) =>
        List.update(
          { position },
          {
            where: {
              id,
              userId: req.user.id,
            },
          }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: "Lists reordered successfully",
      });
    } catch (error) {
      console.error("Reorder lists error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Search lists
// @route   GET /api/lists/search?q=query
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

    const lists = await List.findAll({
      where: {
        userId: req.user.id,
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
        ],
      },
      order: [["position", "ASC"]],
    });

    res.json({
      success: true,
      data: lists,
    });
  } catch (error) {
    console.error("Search lists error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
