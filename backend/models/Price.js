import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Price = sequelize.define(
  "Price",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: true, // External product ID from price APIs
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "ILS",
      validate: {
        len: [3, 3],
      },
    },
    source: {
      type: DataTypes.ENUM(
        "google_shopping",
        "shufersal",
        "rami_levy",
        "victory",
        "api",
        "manual"
      ),
      allowNull: false,
    },
    sourceUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    storeName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    storeLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    availability: {
      type: DataTypes.ENUM("in_stock", "out_of_stock", "limited", "unknown"),
      defaultValue: "unknown",
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: "pcs",
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Price per unit (e.g., per kg, per liter)
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastChecked: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    confidence: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 1.0, // 0.0 to 1.0 - how confident we are in this price
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    tableName: "prices",
    indexes: [
      {
        fields: ["productName"],
      },
      {
        fields: ["source"],
      },
      {
        fields: ["storeName"],
      },
      {
        fields: ["category"],
      },
      {
        fields: ["isActive"],
      },
      {
        fields: ["lastChecked"],
      },
      {
        fields: ["price"],
      },
    ],
  }
);

export { Price };
