import { User } from "./User.js";
import { List } from "./List.js";
import { Task } from "./Task.js";
import { VoiceRecording } from "./VoiceRecording.js";
import { MediaGallery } from "./MediaGallery.js";
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

export { User, List, Task, VoiceRecording, MediaGallery };
