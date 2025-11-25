import { User } from "./User.js";
import { List } from "./List.js";
import { Task } from "./Task.js";
import { VoiceRecording } from "./VoiceRecording.js";
import { MediaGallery } from "./MediaGallery.js";
import { Reminder } from "./Reminder.js";
import { ShoppingItem } from "./ShoppingItem.js";
import { Price } from "./Price.js";
import { Category } from "./Category.js";
import sequelize from "../config/database.js";

// Define associations
User.hasMany(List, {
  foreignKey: "userId",
  as: "lists",
  onDelete: "CASCADE",
});

List.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

List.hasMany(Task, {
  foreignKey: "listId",
  as: "tasks",
  onDelete: "CASCADE",
});

Task.belongsTo(List, {
  foreignKey: "listId",
  as: "list",
});

Task.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Task, {
  foreignKey: "userId",
  as: "tasks",
  onDelete: "CASCADE",
});

User.hasMany(VoiceRecording, {
  foreignKey: "userId",
  as: "voiceRecordings",
  onDelete: "CASCADE",
});

VoiceRecording.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(MediaGallery, {
  foreignKey: "userId",
  as: "mediaGallery",
  onDelete: "CASCADE",
});

MediaGallery.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Reminder associations
User.hasMany(Reminder, {
  foreignKey: "userId",
  as: "reminders",
  onDelete: "CASCADE",
});

Reminder.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Task.hasMany(Reminder, {
  foreignKey: "taskId",
  as: "reminders",
  onDelete: "CASCADE",
});

Reminder.belongsTo(Task, {
  foreignKey: "taskId",
  as: "task",
});

// ShoppingItem associations
User.hasMany(ShoppingItem, {
  foreignKey: "userId",
  as: "shoppingItems",
  onDelete: "CASCADE",
});

ShoppingItem.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

List.hasMany(ShoppingItem, {
  foreignKey: "listId",
  as: "shoppingItems",
  onDelete: "CASCADE",
});

ShoppingItem.belongsTo(List, {
  foreignKey: "listId",
  as: "list",
});

// Category associations (self-referencing for hierarchy)
Category.hasMany(Category, {
  foreignKey: "parentId",
  as: "children",
  onDelete: "SET NULL",
});

Category.belongsTo(Category, {
  foreignKey: "parentId",
  as: "parent",
});

// ShoppingItem-Category association
Category.hasMany(ShoppingItem, {
  foreignKey: "categoryId",
  as: "shoppingItems",
});

ShoppingItem.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "categoryInfo",
});

export {
  User,
  List,
  Task,
  VoiceRecording,
  MediaGallery,
  Reminder,
  ShoppingItem,
  Price,
  Category,
};
