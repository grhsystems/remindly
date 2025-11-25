import express from "express";
import { body, validationResult } from "express-validator";
import { ShoppingItem } from "../models/ShoppingItem.js";
import { List } from "../models/List.js";
import { Category } from "../models/Category.js";
import { protect as auth } from "../middleware/auth.js";
import priceService from "../services/priceService.js";

const router = express.Router();

// Get all shopping items for a user
router.get("/", auth, async (req, res) => {
  try {
    const { listId, category, checked, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      userId: req.user.id,
    };

    if (listId) {
      whereClause.listId = listId;
    }

    if (category) {
      whereClause.category = category;
    }

    if (checked !== undefined) {
      whereClause.checked = checked === "true";
    }

    const items = await ShoppingItem.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: List,
          as: "list",
        },
        {
          model: Category,
          as: "categoryInfo",
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
      items: items.rows,
      total: items.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(items.count / limit),
    });
  } catch (error) {
    console.error("Error fetching shopping items:", error);
    res.status(500).json({ error: "Failed to fetch shopping items" });
  }
});

// Get a specific shopping item
router.get("/:id", auth, async (req, res) => {
  try {
    const item = await ShoppingItem.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: List,
          as: "list",
        },
        {
          model: Category,
          as: "categoryInfo",
        },
      ],
    });

    if (!item) {
      return res.status(404).json({ error: "Shopping item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Error fetching shopping item:", error);
    res.status(500).json({ error: "Failed to fetch shopping item" });
  }
});

// Create a new shopping item
router.post(
  "/",
  auth,
  [
    body("listId").isUUID().withMessage("Valid list ID is required"),
    body("productName")
      .isLength({ min: 1, max: 255 })
      .withMessage("Product name is required"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("unit").optional().isString().withMessage("Unit must be a string"),
    body("price")
      .optional()
      .isDecimal()
      .withMessage("Price must be a valid decimal"),
    body("categoryId")
      .optional()
      .isUUID()
      .withMessage("Valid category ID is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        listId,
        productName,
        quantity = 1,
        unit = "pcs",
        price,
        categoryId,
        notes,
      } = req.body;

      // Verify list belongs to user
      const list = await List.findOne({
        where: {
          id: listId,
          userId: req.user.id,
        },
      });

      if (!list) {
        return res.status(404).json({ error: "List not found" });
      }

      // Get next position
      const lastItem = await ShoppingItem.findOne({
        where: { listId },
        order: [["position", "DESC"]],
      });

      const position = lastItem ? lastItem.position + 1 : 0;

      const item = await ShoppingItem.create({
        listId,
        userId: req.user.id,
        productName,
        quantity,
        unit,
        price,
        categoryId,
        notes,
        position,
      });

      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating shopping item:", error);
      res.status(500).json({ error: "Failed to create shopping item" });
    }
  }
);

// Update a shopping item
router.put(
  "/:id",
  auth,
  [
    body("productName")
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage("Product name is required"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("unit").optional().isString().withMessage("Unit must be a string"),
    body("price")
      .optional()
      .isDecimal()
      .withMessage("Price must be a valid decimal"),
    body("categoryId")
      .optional()
      .isUUID()
      .withMessage("Valid category ID is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const item = await ShoppingItem.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!item) {
        return res.status(404).json({ error: "Shopping item not found" });
      }

      const updatedItem = await item.update(req.body);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating shopping item:", error);
      res.status(500).json({ error: "Failed to update shopping item" });
    }
  }
);

// Delete a shopping item
router.delete("/:id", auth, async (req, res) => {
  try {
    const item = await ShoppingItem.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Shopping item not found" });
    }

    await item.destroy();
    res.json({ message: "Shopping item deleted successfully" });
  } catch (error) {
    console.error("Error deleting shopping item:", error);
    res.status(500).json({ error: "Failed to delete shopping item" });
  }
});

// Toggle item checked status
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
    const item = await ShoppingItem.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Shopping item not found" });
    }

    const updatedItem = await item.update({
      checked: !item.checked,
      checkedAt: !item.checked ? new Date() : null,
    });

    res.json(updatedItem);
  } catch (error) {
    console.error("Error toggling shopping item:", error);
    res.status(500).json({ error: "Failed to toggle shopping item" });
  }
});

// Search prices for an item
router.post("/:id/search-price", auth, async (req, res) => {
  try {
    const item = await ShoppingItem.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Shopping item not found" });
    }

    const prices = await priceService.searchPrices(item.productName, {
      limit: 10,
    });

    res.json(prices);
  } catch (error) {
    console.error("Error searching prices:", error);
    res.status(500).json({ error: "Failed to search prices" });
  }
});

// Update item with price
router.patch(
  "/:id/update-price",
  auth,
  [
    body("price").isDecimal().withMessage("Valid price is required"),
    body("priceSource")
      .optional()
      .isIn(["manual", "api", "scraped"])
      .withMessage("Valid price source is required"),
    body("priceUrl").optional().isURL().withMessage("Valid URL is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { price, priceSource = "manual", priceUrl } = req.body;

      const item = await ShoppingItem.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!item) {
        return res.status(404).json({ error: "Shopping item not found" });
      }

      const updatedItem = await item.update({
        price: parseFloat(price),
        priceSource,
        priceUrl,
        priceUpdatedAt: new Date(),
      });

      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating price:", error);
      res.status(500).json({ error: "Failed to update price" });
    }
  }
);

// Reorder items
router.patch(
  "/reorder",
  auth,
  [
    body("items").isArray().withMessage("Items array is required"),
    body("items.*.id").isUUID().withMessage("Valid item ID is required"),
    body("items.*.position").isInt().withMessage("Valid position is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { items } = req.body;

      for (const itemData of items) {
        await ShoppingItem.update(
          { position: itemData.position },
          {
            where: {
              id: itemData.id,
              userId: req.user.id,
            },
          }
        );
      }

      res.json({ message: "Items reordered successfully" });
    } catch (error) {
      console.error("Error reordering items:", error);
      res.status(500).json({ error: "Failed to reorder items" });
    }
  }
);

// Get shopping statistics
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const { listId, startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const whereClause = {
      userId: req.user.id,
      createdAt: {
        [require("sequelize").Op.between]: [start, end],
      },
    };

    if (listId) {
      whereClause.listId = listId;
    }

    const stats = await ShoppingItem.findAll({
      where: whereClause,
      attributes: [
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "totalItems",
        ],
        [
          require("sequelize").fn("SUM", require("sequelize").col("price")),
          "totalValue",
        ],
        [
          require("sequelize").fn("AVG", require("sequelize").col("price")),
          "averagePrice",
        ],
        [
          require("sequelize").fn(
            "COUNT",
            require("sequelize").literal("CASE WHEN checked = true THEN 1 END")
          ),
          "checkedItems",
        ],
      ],
    });

    res.json(stats[0]);
  } catch (error) {
    console.error("Error fetching shopping stats:", error);
    res.status(500).json({ error: "Failed to fetch shopping statistics" });
  }
});

export default router;
