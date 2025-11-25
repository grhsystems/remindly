import { DataTypes, Op } from "sequelize";
import sequelize from "../config/database.js";

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    listId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "lists",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    priority: {
      type: DataTypes.STRING,
      defaultValue: "medium",
      validate: {
        isIn: [["low", "medium", "high", "urgent"]],
      },
    },
    dueDate: {
      type: DataTypes.DATEONLY,
    },
    dueTime: {
      type: DataTypes.TIME,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    completedAt: {
      type: DataTypes.DATE,
    },
    position: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recurringPattern: {
      type: DataTypes.JSON,
    },
    parentTaskId: {
      type: DataTypes.UUID,
      references: {
        model: "tasks",
        key: "id",
      },
    },
  },
  {
    tableName: "tasks",
    hooks: {
      beforeUpdate: (task) => {
        if (task.changed("completed") && task.completed) {
          task.completedAt = new Date();
        } else if (task.changed("completed") && !task.completed) {
          task.completedAt = null;
        }
      },
    },
  }
);

export { Task };
