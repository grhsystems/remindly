import twilio from "twilio";
import sgMail from "@sendgrid/mail";
import admin from "firebase-admin";
import { logger } from "../utils/logger.js";

// Initialize Twilio
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
} catch (error) {
  logger.warn("Twilio not configured properly:", error.message);
}

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    logger.warn("Firebase Admin not initialized:", error.message);
  }
}

/**
 * Send SMS notification
 * @param {string} phoneNumber - Phone number with country code
 * @param {string} message - Message text
 * @returns {Promise<Object>} SMS result
 */
export const sendSMS = async (phoneNumber, message) => {
  try {
    if (!twilioClient) {
      throw new Error("Twilio not configured");
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    logger.info("SMS sent successfully", { to: phoneNumber, sid: result.sid });
    return {
      success: true,
      messageId: result.sid,
      to: phoneNumber,
    };
  } catch (error) {
    logger.error("Send SMS error:", error);
    throw new Error("Failed to send SMS");
  }
};

/**
 * Send Email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content
 * @returns {Promise<Object>} Email result
 */
export const sendEmail = async (to, subject, text, html = null) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SendGrid not configured");
    }

    const msg = {
      to,
      from: process.env.FROM_EMAIL || "noreply@remindly.app",
      subject,
      text,
      html: html || text,
    };

    const result = await sgMail.send(msg);

    logger.info("Email sent successfully", { to, subject });
    return {
      success: true,
      to,
      subject,
    };
  } catch (error) {
    logger.error("Send email error:", error);
    throw new Error("Failed to send email");
  }
};

/**
 * Send Push notification
 * @param {string} token - FCM device token
 * @param {Object} notification - Notification data
 * @returns {Promise<Object>} Push result
 */
export const sendPushNotification = async (token, notification) => {
  try {
    if (!admin.apps.length) {
      throw new Error("Firebase Admin not configured");
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.image,
      },
      data: notification.data || {},
      token,
    };

    const result = await admin.messaging().send(message);

    logger.info("Push notification sent successfully", {
      token,
      messageId: result,
    });
    return {
      success: true,
      messageId: result,
      token,
    };
  } catch (error) {
    logger.error("Send push notification error:", error);
    throw new Error("Failed to send push notification");
  }
};

/**
 * Send Voice call (automated phone call)
 * @param {string} phoneNumber - Phone number with country code
 * @param {string} message - Message to speak
 * @param {string} language - Language code (he/en)
 * @returns {Promise<Object>} Call result
 */
export const makeVoiceCall = async (phoneNumber, message, language = "he") => {
  try {
    if (!twilioClient) {
      throw new Error("Twilio not configured");
    }

    const voiceMap = {
      he: "alice", // Hebrew voice
      en: "alice",
    };

    const twiml = `
      <Response>
        <Say voice="${voiceMap[language] || "alice"}" language="${language === "he" ? "he-IL" : "en-US"}">
          ${message}
        </Say>
        <Pause length="1"/>
        <Say voice="${voiceMap[language] || "alice"}" language="${language === "he" ? "he-IL" : "en-US"}">
          ${language === "he" ? "להאזנה נוספת, לחץ 1" : "To hear again, press 1"}
        </Say>
        <Gather numDigits="1" action="/api/voice-response" method="POST">
          <Pause length="5"/>
        </Gather>
      </Response>
    `;

    const call = await twilioClient.calls.create({
      twiml,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    logger.info("Voice call initiated", { to: phoneNumber, sid: call.sid });
    return {
      success: true,
      callId: call.sid,
      to: phoneNumber,
    };
  } catch (error) {
    logger.error("Make voice call error:", error);
    throw new Error("Failed to make voice call");
  }
};

/**
 * Send multi-channel notification
 * @param {Object} user - User object
 * @param {Object} task - Task object
 * @param {Array} channels - Channels to use ['sms', 'email', 'push', 'call']
 * @returns {Promise<Object>} Results from all channels
 */
export const sendTaskReminder = async (user, task, channels = ["push"]) => {
  try {
    const results = {};
    const language = user.languagePreference || "he";

    const message =
      language === "he"
        ? `תזכורת: ${task.title}${task.description ? "\n" + task.description : ""}`
        : `Reminder: ${task.title}${task.description ? "\n" + task.description : ""}`;

    // Send to each requested channel
    for (const channel of channels) {
      try {
        switch (channel) {
          case "sms":
            if (user.phoneNumber) {
              results.sms = await sendSMS(user.phoneNumber, message);
            }
            break;

          case "email":
            if (user.email) {
              const subject =
                language === "he" ? "תזכורת ממשימה" : "Task Reminder";
              const html = `
                <div dir="${language === "he" ? "rtl" : "ltr"}">
                  <h2>${task.title}</h2>
                  ${task.description ? `<p>${task.description}</p>` : ""}
                  ${task.dueDate ? `<p>${language === "he" ? "תאריך יעד" : "Due date"}: ${task.dueDate} ${task.dueTime || ""}</p>` : ""}
                  <p>${language === "he" ? "עדיפות" : "Priority"}: ${task.priority}</p>
                </div>
              `;
              results.email = await sendEmail(
                user.email,
                subject,
                message,
                html
              );
            }
            break;

          case "push":
            if (user.fcmToken) {
              results.push = await sendPushNotification(user.fcmToken, {
                title: language === "he" ? "תזכורת למשימה" : "Task Reminder",
                body: message,
                data: {
                  taskId: task.id,
                  type: "task_reminder",
                },
              });
            }
            break;

          case "call":
            if (user.phoneNumber) {
              results.call = await makeVoiceCall(
                user.phoneNumber,
                message,
                language
              );
            }
            break;

          default:
            logger.warn("Unknown notification channel:", channel);
        }
      } catch (channelError) {
        logger.error(`Error sending ${channel} notification:`, channelError);
        results[channel] = { success: false, error: channelError.message };
      }
    }

    return {
      success: true,
      results,
      taskId: task.id,
    };
  } catch (error) {
    logger.error("Send task reminder error:", error);
    throw new Error("Failed to send task reminder");
  }
};

export default {
  sendSMS,
  sendEmail,
  sendPushNotification,
  makeVoiceCall,
  sendTaskReminder,
};
