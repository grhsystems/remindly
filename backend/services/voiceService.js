import axios from "axios";
import FormData from "form-data";
import { logger } from "../utils/logger.js";
import fs from "fs";

/**
 * Convert audio to text using OpenAI Whisper
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} language - Language code
 * @returns {Promise<string>} Transcribed text
 */
export const transcribeAudio = async (audioBuffer, language = "he") => {
  try {
    const formData = new FormData();
    formData.append("file", audioBuffer, {
      filename: "audio.webm",
      contentType: "audio/webm",
    });
    formData.append("model", "whisper-1");
    if (language) {
      formData.append("language", language);
    }

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const text = response.data.text;
    logger.info("Audio transcribed successfully", { textLength: text.length });
    return text;
  } catch (error) {
    logger.error("Transcribe audio error:", error);
    throw new Error("Failed to transcribe audio");
  }
};

/**
 * Send audio to webhook for processing (Make.com/n8n)
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Webhook response
 */
export const sendToWebhook = async (audioBuffer, metadata = {}) => {
  try {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
      throw new Error("Webhook URL not configured");
    }

    const formData = new FormData();
    formData.append("audio", audioBuffer, {
      filename: "audio.webm",
      contentType: "audio/webm",
    });
    formData.append("userId", metadata.userId);
    formData.append("language", metadata.language || "he");
    formData.append("timestamp", new Date().toISOString());

    const response = await axios.post(webhookUrl, formData, {
      headers: formData.getHeaders(),
      timeout: 30000, // 30 seconds timeout
    });

    logger.info("Audio sent to webhook successfully", {
      userId: metadata.userId,
      responseStatus: response.status,
    });

    return response.data;
  } catch (error) {
    logger.error("Send to webhook error:", error);
    throw new Error("Failed to send audio to webhook");
  }
};

/**
 * Process voice recording end-to-end
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {Object} metadata - Metadata (userId, language)
 * @returns {Promise<Object>} Processed result with text and parsed data
 */
export const processVoiceRecording = async (audioBuffer, metadata) => {
  try {
    // Step 1: Transcribe audio
    const text = await transcribeAudio(audioBuffer, metadata.language);

    // Step 2: Send to webhook if configured
    let webhookResult = null;
    if (process.env.WEBHOOK_URL) {
      try {
        webhookResult = await sendToWebhook(audioBuffer, metadata);
      } catch (webhookError) {
        logger.warn(
          "Webhook processing failed, continuing with local processing",
          webhookError
        );
      }
    }

    return {
      text,
      webhookResult,
      metadata: {
        duration: audioBuffer.length,
        language: metadata.language,
        processedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    logger.error("Process voice recording error:", error);
    throw new Error("Failed to process voice recording");
  }
};

/**
 * Save audio file temporarily
 * @param {Buffer} audioBuffer - Audio buffer
 * @param {string} filename - File name
 * @returns {Promise<string>} File path
 */
export const saveAudioFile = async (audioBuffer, filename) => {
  try {
    const uploadDir = "./uploads/audio";

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = `${uploadDir}/${filename}`;
    await fs.promises.writeFile(filePath, audioBuffer);

    logger.info("Audio file saved", { filePath });
    return filePath;
  } catch (error) {
    logger.error("Save audio file error:", error);
    throw new Error("Failed to save audio file");
  }
};

/**
 * Delete audio file
 * @param {string} filePath - File path
 */
export const deleteAudioFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      logger.info("Audio file deleted", { filePath });
    }
  } catch (error) {
    logger.error("Delete audio file error:", error);
  }
};

export default {
  transcribeAudio,
  sendToWebhook,
  processVoiceRecording,
  saveAudioFile,
  deleteAudioFile,
};
