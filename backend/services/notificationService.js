import twilio from "twilio";
import sgMail from "@sendgrid/mail";
import admin from "firebase-admin";
import { Reminder } from "../models/Reminder.js";
import { User } from "../models/User.js";

// Initialize services
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  } catch (error) {
    console.warn("Twilio initialization failed:", error.message);
  }
}

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

class NotificationService {
  /**
   * Send push notification
   */
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      const user = await User.findByPk(userId);
      if (!user || !user.settings?.fcmToken) {
        throw new Error("User FCM token not found");
      }

      const message = {
        token: user.settings.fcmToken,
        notification: {
          title: title,
          body: body,
        },
        data: data,
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "remindly_notifications",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log("Push notification sent:", response);
      return response;
    } catch (error) {
      console.error("Push notification error:", error);
      throw error;
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(phoneNumber, message) {
    try {
      if (!twilioClient) {
        throw new Error("Twilio not configured");
      }

      const response = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      console.log("SMS sent:", response.sid);
      return response;
    } catch (error) {
      console.error("SMS error:", error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(to, subject, htmlContent, textContent) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error("SendGrid not configured");
      }

      const msg = {
        to: to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: subject,
        text: textContent,
        html: htmlContent,
      };

      const response = await sgMail.send(msg);
      console.log("Email sent:", response[0].statusCode);
      return response;
    } catch (error) {
      console.error("Email error:", error);
      throw error;
    }
  }

  /**
   * Make phone call
   */
  async makePhoneCall(phoneNumber, message) {
    try {
      if (!twilioClient) {
        throw new Error("Twilio not configured");
      }

      const response = await twilioClient.calls.create({
        twiml: `<Response><Say voice="alice" language="he">${message}</Say></Response>`,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
      });

      console.log("Phone call initiated:", response.sid);
      return response;
    } catch (error) {
      console.error("Phone call error:", error);
      throw error;
    }
  }

  /**
   * Process pending reminders
   */
  async processPendingReminders() {
    try {
      const now = new Date();
      const pendingReminders = await Reminder.findAll({
        where: {
          sent: false,
          isActive: true,
          reminderTime: {
            [require("sequelize").Op.lte]: now,
          },
        },
        include: [
          {
            model: User,
            as: "user",
          },
        ],
      });

      console.log(`Processing ${pendingReminders.length} pending reminders`);

      for (const reminder of pendingReminders) {
        try {
          await this.sendReminder(reminder);
          await reminder.update({
            sent: true,
            sentAt: new Date(),
            deliveryStatus: "sent",
          });
        } catch (error) {
          console.error(`Failed to send reminder ${reminder.id}:`, error);
          await this.handleReminderError(reminder, error);
        }
      }
    } catch (error) {
      console.error("Error processing reminders:", error);
    }
  }

  /**
   * Send a specific reminder
   */
  async sendReminder(reminder) {
    const user = reminder.user;
    const { reminderType, title, message } = reminder;

    switch (reminderType) {
      case "push":
        await this.sendPushNotification(user.id, title, message, {
          reminderId: reminder.id,
        });
        break;

      case "sms":
        if (user.phoneNumber) {
          await this.sendSMS(user.phoneNumber, `${title}\n${message}`);
        } else {
          throw new Error("User phone number not found");
        }
        break;

      case "email":
        if (user.email) {
          const htmlContent = this.generateEmailHTML(title, message);
          await this.sendEmail(user.email, title, htmlContent, message);
        } else {
          throw new Error("User email not found");
        }
        break;

      case "call":
        if (user.phoneNumber) {
          await this.makePhoneCall(user.phoneNumber, `${title}. ${message}`);
        } else {
          throw new Error("User phone number not found");
        }
        break;

      default:
        throw new Error(`Unknown reminder type: ${reminderType}`);
    }
  }

  /**
   * Handle reminder sending errors
   */
  async handleReminderError(reminder, error) {
    const retryCount = reminder.retryCount + 1;
    const maxRetries = reminder.maxRetries;

    if (retryCount < maxRetries) {
      // Retry after exponential backoff
      const retryDelay = Math.pow(2, retryCount) * 60 * 1000; // minutes to milliseconds
      const retryTime = new Date(Date.now() + retryDelay);

      await reminder.update({
        retryCount: retryCount,
        reminderTime: retryTime,
        deliveryStatus: "pending",
        deliveryDetails: {
          ...reminder.deliveryDetails,
          lastError: error.message,
          retryCount: retryCount,
        },
      });

      console.log(
        `Reminder ${reminder.id} scheduled for retry ${retryCount}/${maxRetries} at ${retryTime}`
      );
    } else {
      // Max retries reached, mark as failed
      await reminder.update({
        deliveryStatus: "failed",
        deliveryDetails: {
          ...reminder.deliveryDetails,
          lastError: error.message,
          maxRetriesReached: true,
        },
      });

      console.error(
        `Reminder ${reminder.id} failed after ${maxRetries} retries`
      );
    }
  }

  /**
   * Generate HTML email content
   */
  generateEmailHTML(title, message) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #DDA0DD 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            color: #333;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 ${title}</h1>
          </div>
          <div class="content">
            <div class="message">${message}</div>
          </div>
          <div class="footer">
            <p>תזכורת מ-Remindly</p>
            <p>אפליקציה חכמה לניהול משימות ותזכורות</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications) {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const notification of notifications) {
      try {
        await this.sendReminder(notification);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          reminderId: notification.id,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId, startDate, endDate) {
    const whereClause = {
      userId: userId,
      sent: true,
      sentAt: {
        [require("sequelize").Op.between]: [startDate, endDate],
      },
    };

    const stats = await Reminder.findAll({
      where: whereClause,
      attributes: [
        "reminderType",
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "count",
        ],
      ],
      group: ["reminderType"],
    });

    return stats;
  }
}

export default new NotificationService();
