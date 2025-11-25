import express from "express";
import { body, validationResult } from "express-validator";
import { MediaGallery } from "../models/MediaGallery.js";
import { protect } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Op } from "sequelize";
import { logger } from "../utils/logger.js";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for media file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/media"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `media-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes =
      /image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|avi|mov|wmv|flv|webm)|audio\/(mp3|wav|m4a|aac|ogg)/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image, video, and audio files are allowed"));
    }
  },
});

// Helper function to generate thumbnail
const generateThumbnail = async (filePath, mediaType) => {
  try {
    if (mediaType === "image") {
      const thumbnailPath = filePath.replace(/\.[^/.]+$/, "_thumb.jpg");
      await sharp(filePath)
        .resize(300, 300, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      return thumbnailPath.replace(__dirname + "/../", "");
    } else if (mediaType === "video") {
      const thumbnailPath = filePath.replace(/\.[^/.]+$/, "_thumb.jpg");
      return new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .screenshots({
            timestamps: ["10%"],
            filename: path.basename(thumbnailPath),
            folder: path.dirname(thumbnailPath),
            size: "300x300",
          })
          .on("end", () => {
            resolve(thumbnailPath.replace(__dirname + "/../", ""));
          })
          .on("error", reject);
      });
    }
    return null;
  } catch (error) {
    logger.error("Error generating thumbnail:", error);
    return null;
  }
};

// Helper function to get media dimensions
const getMediaDimensions = async (filePath, mediaType) => {
  try {
    if (mediaType === "image") {
      const metadata = await sharp(filePath).metadata();
      return { width: metadata.width, height: metadata.height };
    } else if (mediaType === "video") {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
          if (err) return reject(err);
          const videoStream = metadata.streams.find(
            (s) => s.codec_type === "video"
          );
          resolve({
            width: videoStream?.width || 0,
            height: videoStream?.height || 0,
          });
        });
      });
    }
    return { width: 0, height: 0 };
  } catch (error) {
    logger.error("Error getting media dimensions:", error);
    return { width: 0, height: 0 };
  }
};

// Helper function to get video duration
const getVideoDuration = async (filePath) => {
  try {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        const videoStream = metadata.streams.find(
          (s) => s.codec_type === "video"
        );
        resolve(Math.round(parseFloat(videoStream?.duration || 0)));
      });
    });
  } catch (error) {
    logger.error("Error getting video duration:", error);
    return 0;
  }
};

// @desc    Get all media items for user
// @route   GET /api/media-gallery
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      search,
      mediaType,
      archived = false,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const whereClause = {
      userId: req.user.id,
      isArchived: archived === "true",
    };

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } },
      ];
    }

    if (mediaType) {
      whereClause.mediaType = mediaType;
    }

    const mediaItems = await MediaGallery.findAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: mediaItems,
    });
  } catch (error) {
    logger.error("Get media gallery error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get single media item
// @route   GET /api/media-gallery/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const mediaItem = await MediaGallery.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        error: "Media item not found",
      });
    }

    // Increment view count
    await mediaItem.increment("viewCount");

    res.json({
      success: true,
      data: mediaItem,
    });
  } catch (error) {
    logger.error("Get media item error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Upload new media item
// @route   POST /api/media-gallery
// @access  Private
router.post(
  "/",
  protect,
  upload.single("media"),
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Title must be between 1 and 255 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters"),
    body("mediaType")
      .isIn(["image", "video", "audio"])
      .withMessage("Media type must be image, video, or audio"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Media file is required",
        });
      }

      const {
        title,
        description,
        mediaType,
        tags = [],
        isPublic = false,
      } = req.body;

      // Generate thumbnail
      const thumbnailUrl = await generateThumbnail(req.file.path, mediaType);

      // Get media dimensions
      const dimensions = await getMediaDimensions(req.file.path, mediaType);

      // Get duration for videos/audio
      let duration = 0;
      if (mediaType === "video" || mediaType === "audio") {
        duration = await getVideoDuration(req.file.path);
      }

      const mediaItem = await MediaGallery.create({
        title:
          title ||
          `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} ${new Date().toLocaleDateString()}`,
        description,
        mediaType,
        fileUrl: `/uploads/media/${req.file.filename}`,
        thumbnailUrl,
        fileSize: req.file.size,
        duration,
        dimensions,
        tags: Array.isArray(tags) ? tags : [],
        isPublic: isPublic === "true",
        userId: req.user.id,
      });

      res.status(201).json({
        success: true,
        data: mediaItem,
      });
    } catch (error) {
      logger.error("Create media item error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Update media item
// @route   PUT /api/media-gallery/:id
// @access  Private
router.put(
  "/:id",
  protect,
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Title must be between 1 and 255 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const mediaItem = await MediaGallery.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!mediaItem) {
        return res.status(404).json({
          success: false,
          error: "Media item not found",
        });
      }

      const { title, description, tags, isPublic } = req.body;
      const updateData = {};

      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (tags) updateData.tags = Array.isArray(tags) ? tags : [];
      if (isPublic !== undefined) updateData.isPublic = isPublic;

      await mediaItem.update(updateData);

      res.json({
        success: true,
        data: mediaItem,
      });
    } catch (error) {
      logger.error("Update media item error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Delete media item
// @route   DELETE /api/media-gallery/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const mediaItem = await MediaGallery.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        error: "Media item not found",
      });
    }

    // Delete the media file
    const fs = await import("fs");
    const filePath = path.join(__dirname, "..", mediaItem.fileUrl);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      logger.warn("Could not delete media file:", fileError);
    }

    // Delete thumbnail if exists
    if (mediaItem.thumbnailUrl) {
      const thumbnailPath = path.join(__dirname, "..", mediaItem.thumbnailUrl);
      try {
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      } catch (fileError) {
        logger.warn("Could not delete thumbnail file:", fileError);
      }
    }

    await mediaItem.destroy();

    res.json({
      success: true,
      message: "Media item deleted successfully",
    });
  } catch (error) {
    logger.error("Delete media item error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Archive/Unarchive media item
// @route   PATCH /api/media-gallery/:id/archive
// @access  Private
router.patch(
  "/:id/archive",
  protect,
  [body("archived").isBoolean().withMessage("Archived must be boolean")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { archived } = req.body;

      const mediaItem = await MediaGallery.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!mediaItem) {
        return res.status(404).json({
          success: false,
          error: "Media item not found",
        });
      }

      await mediaItem.update({ isArchived: archived });

      res.json({
        success: true,
        data: mediaItem,
      });
    } catch (error) {
      logger.error("Archive media item error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Share media item
// @route   POST /api/media-gallery/:id/share
// @access  Private
router.post("/:id/share", protect, async (req, res) => {
  try {
    const mediaItem = await MediaGallery.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        error: "Media item not found",
      });
    }

    // Increment share count
    await mediaItem.increment("shareCount");

    res.json({
      success: true,
      data: {
        shareUrl: `${req.protocol}://${req.get("host")}/media/${mediaItem.id}`,
        shareCount: mediaItem.shareCount + 1,
      },
    });
  } catch (error) {
    logger.error("Share media item error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
