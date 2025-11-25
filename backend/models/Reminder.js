import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Reminder = sequelize.define(
  "Reminder",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tasks",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    reminderTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reminderType: {
      type: DataTypes.ENUM("push", "sms", "email", "call"),
      allowNull: false,
      defaultValue: "push",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sentAt: {
      type: DataTypes.DATE,
    },
    deliveryStatus: {
      type: DataTypes.ENUM("pending", "sent", "delivered", "failed"),
      defaultValue: "pending",
    },
    deliveryDetails: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    retryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    maxRetries: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    tableName: "reminders",
    indexes: [
      {
        fields: ["reminderTime"],
      },
      {
        fields: ["userId"],
      },
      {
        fields: ["taskId"],
      },
      {
        fields: ["sent"],
      },
      {
        fields: ["reminderType"],
      },
    ],
  }
);

export { Reminder };
