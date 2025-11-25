import { DataTypes, Op } from "sequelize";
import sequelize from "../config/database.js";

const List = sequelize.define(
  "List",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: "mdi-format-list-bulleted",
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: "#1976d2",
    },
    position: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    tableName: "lists",
  }
);

export { List };
