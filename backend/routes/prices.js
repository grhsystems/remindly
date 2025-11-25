import express from "express";
import { body, validationResult } from "express-validator";
import { protect as auth } from "../middleware/auth.js";
import priceService from "../services/priceService.js";
import { Price } from "../models/Price.js";

const router = express.Router();

// Search prices
router.get("/search", auth, async (req, res) => {
  try {
    const {
      product,
      limit = 10,
      minPrice,
      maxPrice,
      category,
      store,
    } = req.query;

    if (!product) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const options = {
      limit: parseInt(limit),
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      category,
      store,
    };

    const prices = await priceService.searchPrices(product, options);

    res.json({
      success: true,
      product,
      prices,
      total: prices.length,
    });
  } catch (error) {
    console.error("Price search error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search prices",
    });
  }
});

// Get price history for a product
router.get("/history/:product", auth, async (req, res) => {
  try {
    const { product } = req.params;
    const { days = 30 } = req.query;

    const history = await priceService.getPriceHistory(product, parseInt(days));

    res.json({
      success: true,
      product,
      history,
      total: history.length,
    });
  } catch (error) {
    console.error("Price history error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch price history",
    });
  }
});

// Get price statistics
router.get("/stats/:product", auth, async (req, res) => {
  try {
    const { product } = req.params;

    const stats = await priceService.getPriceStats(product);

    res.json({
      success: true,
      product,
      stats,
    });
  } catch (error) {
    console.error("Price stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch price statistics",
    });
  }
});

// Get all prices (admin only)
router.get("/", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const {
      page = 1,
      limit = 50,
      product,
      source,
      store,
      category,
      isActive = true,
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {
      isActive: isActive === "true",
    };

    if (product) {
      whereClause.productName = {
        [require("sequelize").Op.iLike]: `%${product}%`,
      };
    }

    if (source) {
      whereClause.source = source;
    }

    if (store) {
      whereClause.storeName = {
        [require("sequelize").Op.iLike]: `%${store}%`,
      };
    }

    if (category) {
      whereClause.category = category;
    }

    const prices = await Price.findAndCountAll({
      where: whereClause,
      order: [["lastChecked", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      prices: prices.rows,
      total: prices.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(prices.count / limit),
    });
  } catch (error) {
    console.error("Error fetching prices:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch prices",
    });
  }
});

// Update stale prices (admin only)
router.post("/update-stale", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    await priceService.updateStalePrices();

    res.json({
      success: true,
      message: "Stale prices update initiated",
    });
  } catch (error) {
    console.error("Error updating stale prices:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update stale prices",
    });
  }
});

// Get price sources
router.get("/sources", auth, async (req, res) => {
  try {
    const sources = await Price.findAll({
      attributes: [
        "source",
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "count",
        ],
      ],
      where: {
        isActive: true,
      },
      group: ["source"],
      order: [
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "DESC",
        ],
      ],
    });

    res.json({
      success: true,
      sources,
    });
  } catch (error) {
    console.error("Error fetching price sources:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch price sources",
    });
  }
});

// Get stores
router.get("/stores", auth, async (req, res) => {
  try {
    const stores = await Price.findAll({
      attributes: [
        "storeName",
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "count",
        ],
      ],
      where: {
        isActive: true,
        storeName: {
          [require("sequelize").Op.ne]: null,
        },
      },
      group: ["storeName"],
      order: [
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "DESC",
        ],
      ],
    });

    res.json({
      success: true,
      stores,
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stores",
    });
  }
});

// Get categories
router.get("/categories", auth, async (req, res) => {
  try {
    const categories = await Price.findAll({
      attributes: [
        "category",
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "count",
        ],
      ],
      where: {
        isActive: true,
        category: {
          [require("sequelize").Op.ne]: null,
        },
      },
      group: ["category"],
      order: [
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "DESC",
        ],
      ],
    });

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
    });
  }
});

export default router;
