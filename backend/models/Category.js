import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
    nameEn: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: "mdi-tag",
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: "#1976d2",
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true, // e.g., "food/dairy/milk"
    },
    position: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // System categories vs user-created
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    tableName: "categories",
    indexes: [
      {
        fields: ["parentId"],
      },
      {
        fields: ["level"],
      },
      {
        fields: ["isActive"],
      },
      {
        fields: ["isSystem"],
      },
      {
        fields: ["usageCount"],
      },
      {
        fields: ["position"],
      },
    ],
  }
);

export { Category };
