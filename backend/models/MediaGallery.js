import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MediaGallery = sequelize.define(
  "MediaGallery",
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
    mediaType: {
      type: DataTypes.ENUM("image", "video", "audio"),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
    },
    fileSize: {
      type: DataTypes.INTEGER, // File size in bytes
      allowNull: false,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.INTEGER, // Duration in seconds for videos/audio
      defaultValue: 0,
    },
    dimensions: {
      type: DataTypes.JSON, // { width: number, height: number }
      defaultValue: {},
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    shareCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "media_gallery",
    hooks: {
      beforeCreate: (media) => {
        // Generate title if not provided
        if (!media.title) {
          const date = new Date();
          media.title = `${media.mediaType.charAt(0).toUpperCase() + media.mediaType.slice(1)} ${date.toLocaleDateString()}`;
        }
      },
    },
  }
);

export { MediaGallery };
