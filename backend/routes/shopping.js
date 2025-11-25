import express from "express";
import { body, validationResult } from "express-validator";
import { Task } from "../models/Task.js";
import { List } from "../models/List.js";
import { protect } from "../middleware/auth.js";
import { Op } from "sequelize";
import { logger } from "../utils/logger.js";

const router = express.Router();

// @desc    Get shopping list
// @route   GET /api/shopping
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    // Find or create shopping list
    let shoppingList = await List.findOne({
      where: {
        userId: req.user.id,
        name: { [Op.iLike]: "%shopping%" },
      },
      include: [
        {
          model: Task,
          as: "tasks",
          order: [["position", "ASC"]],
        },
      ],
    });

    if (!shoppingList) {
      // Create shopping list if it doesn't exist
      const lastList = await List.findOne({
        where: { userId: req.user.id },
        order: [["position", "DESC"]],
      });
      const position = lastList ? lastList.position + 1 : 0;

      shoppingList = await List.create({
        name: "Shopping",
        description: "Shopping list",
        icon: "mdi-cart",
        color: "#4CAF50",
        position,
        userId: req.user.id,
      });
    }

    res.json({
      success: true,
      data: shoppingList,
    });
  } catch (error) {
    logger.error("Get shopping list error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Add item to shopping list
// @route   POST /api/shopping/items
// @access  Private
router.post(
  "/items",
  protect,
  [
    body("name")
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Item name is required"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("category")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Category must be less than 100 characters"),
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

      const { name, quantity = 1, price, category } = req.body;

      // Find or create shopping list
      let shoppingList = await List.findOne({
        where: {
          userId: req.user.id,
          name: { [Op.iLike]: "%shopping%" },
        },
      });

      if (!shoppingList) {
        const lastList = await List.findOne({
          where: { userId: req.user.id },
          order: [["position", "DESC"]],
        });
        const position = lastList ? lastList.position + 1 : 0;

        shoppingList = await List.create({
          name: "Shopping",
          description: "Shopping list",
          icon: "mdi-cart",
          color: "#4CAF50",
          position,
          userId: req.user.id,
        });
      }

      // Get next position
      const lastTask = await Task.findOne({
        where: { listId: shoppingList.id },
        order: [["position", "DESC"]],
      });
      const position = lastTask ? lastTask.position + 1 : 0;

      // Create shopping item as a task
      const item = await Task.create({
        title: name,
        description: `Quantity: ${quantity}${price ? `, Price: $${price}` : ""}${category ? `, Category: ${category}` : ""}`,
        listId: shoppingList.id,
        priority: "medium",
        position,
        userId: req.user.id,
        metadata: {
          type: "shopping_item",
          quantity,
          price,
          category,
        },
      });

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      logger.error("Add shopping item error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Update shopping item
// @route   PUT /api/shopping/items/:id
// @access  Private
router.put(
  "/items/:id",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Item name must be between 1 and 255 characters"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("category")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Category must be less than 100 characters"),
    body("completed")
      .optional()
      .isBoolean()
      .withMessage("Completed must be a boolean"),
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

      const { name, quantity, price, category, completed } = req.body;

      const item = await Task.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
        include: [
          {
            model: List,
            as: "list",
            where: { name: { [Op.iLike]: "%shopping%" } },
          },
        ],
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          error: "Shopping item not found",
        });
      }

      const updateData = {};
      if (name) updateData.title = name;
      if (completed !== undefined) updateData.completed = completed;

      // Update metadata
      const metadata = item.metadata || {};
      if (quantity !== undefined) metadata.quantity = quantity;
      if (price !== undefined) metadata.price = price;
      if (category !== undefined) metadata.category = category;

      updateData.metadata = metadata;
      updateData.description = `Quantity: ${metadata.quantity || 1}${metadata.price ? `, Price: $${metadata.price}` : ""}${metadata.category ? `, Category: ${metadata.category}` : ""}`;

      await item.update(updateData);

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      logger.error("Update shopping item error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Delete shopping item
// @route   DELETE /api/shopping/items/:id
// @access  Private
router.delete("/items/:id", protect, async (req, res) => {
  try {
    const item = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: List,
          as: "list",
          where: { name: { [Op.iLike]: "%shopping%" } },
        },
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Shopping item not found",
      });
    }

    await item.destroy();

    res.json({
      success: true,
      message: "Shopping item deleted successfully",
    });
  } catch (error) {
    logger.error("Delete shopping item error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get shopping statistics
// @route   GET /api/shopping/stats
// @access  Private
router.get("/stats", protect, async (req, res) => {
  try {
    const shoppingList = await List.findOne({
      where: {
        userId: req.user.id,
        name: { [Op.iLike]: "%shopping%" },
      },
      include: [
        {
          model: Task,
          as: "tasks",
          where: {
            metadata: {
              [Op.contains]: { type: "shopping_item" },
            },
          },
        },
      ],
    });

    if (!shoppingList) {
      return res.json({
        success: true,
        data: {
          totalItems: 0,
          completedItems: 0,
          totalValue: 0,
          categories: [],
        },
      });
    }

    const items = shoppingList.tasks;
    const totalItems = items.length;
    const completedItems = items.filter((item) => item.completed).length;

    const totalValue = items.reduce((sum, item) => {
      const price = item.metadata?.price || 0;
      const quantity = item.metadata?.quantity || 1;
      return sum + price * quantity;
    }, 0);

    const categories = [
      ...new Set(items.map((item) => item.metadata?.category).filter(Boolean)),
    ];

    res.json({
      success: true,
      data: {
        totalItems,
        completedItems,
        totalValue: Math.round(totalValue * 100) / 100,
        categories,
      },
    });
  } catch (error) {
    logger.error("Get shopping stats error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
