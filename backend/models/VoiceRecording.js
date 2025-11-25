import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const VoiceRecording = sequelize.define(
  "VoiceRecording",
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
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // Duration in seconds
      allowNull: false,
      defaultValue: 0,
    },
    fileSize: {
      type: DataTypes.INTEGER, // File size in bytes
      allowNull: false,
      defaultValue: 0,
    },
    transcription: {
      type: DataTypes.TEXT,
    },
    isProcessed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isTranscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: "auto",
      validate: {
        isIn: [["he", "en", "auto"]],
      },
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "voice_recordings",
    hooks: {
      beforeCreate: (recording) => {
        // Generate title if not provided
        if (!recording.title) {
          const date = new Date();
          recording.title = `Recording ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        }
      },
    },
  }
);

export { VoiceRecording };
