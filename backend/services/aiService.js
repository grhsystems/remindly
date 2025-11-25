import OpenAI from "openai";
import { Task } from "../models/Task.js";
import { List } from "../models/List.js";
import { ShoppingItem } from "../models/ShoppingItem.js";
import { Reminder } from "../models/Reminder.js";
import { Category } from "../models/Category.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  /**
   * Process text input and extract tasks, shopping items, or other actionable items
   * @param {string} text - Input text to process
   * @param {string} userId - User ID
   * @param {string} language - Language of the text (he/en)
   * @returns {Object} Processed results
   */
  async processText(text, userId, language = "he") {
    try {
      const prompt = this.buildPrompt(text, language);
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that processes natural language text and extracts actionable items like tasks, shopping items, appointments, etc. 
            You should analyze the text and return structured data in JSON format.
            The user's language is ${language}.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content);
      return await this.processResults(result, userId, language);
    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error("Failed to process text with AI");
    }
  }

  /**
   * Build prompt for AI processing
   */
  buildPrompt(text, language) {
    const languageInstructions =
      language === "he"
        ? "עברית - זהה תאריכים בעברית (היום, מחר, השבוע, וכו')"
        : "English - identify dates in English (today, tomorrow, this week, etc.)";

    return `Analyze the following text and extract actionable items. Return a JSON object with this structure:

{
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "priority": "low|medium|high|urgent",
      "dueDate": "YYYY-MM-DD or relative date",
      "dueTime": "HH:MM",
      "listType": "tasks|shopping|calls|meetings|appointments|repairs|ideas"
    }
  ],
  "shoppingItems": [
    {
      "productName": "Product name",
      "quantity": 1,
      "unit": "pcs|kg|liter|etc",
      "category": "food|household|etc"
    }
  ],
  "appointments": [
    {
      "title": "Appointment title",
      "description": "Description",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "location": "Location if mentioned"
    }
  ],
  "contacts": [
    {
      "name": "Contact name",
      "phone": "Phone number if mentioned",
      "action": "call|meeting|etc"
    }
  ]
}

Text to analyze: "${text}"

Instructions:
- ${languageInstructions}
- Extract dates and times accurately
- Identify the type of action needed
- If it's a shopping item, include quantity and unit
- If it's a task, determine priority based on urgency words
- If it's an appointment, include location if mentioned
- Return empty arrays if no items found in that category`;
  }

  /**
   * Process AI results and create database entries
   */
  async processResults(results, userId, language) {
    const createdItems = {
      tasks: [],
      shoppingItems: [],
      appointments: [],
      reminders: [],
    };

    try {
      // Process tasks
      if (results.tasks && results.tasks.length > 0) {
        for (const taskData of results.tasks) {
          const list = await this.getOrCreateList(
            userId,
            taskData.listType,
            language
          );
          const task = await Task.create({
            listId: list.id,
            userId: userId,
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority || "medium",
            dueDate: this.parseDate(taskData.dueDate),
            dueTime: taskData.dueTime,
            metadata: {
              aiGenerated: true,
              originalText: taskData.originalText,
            },
          });

          createdItems.tasks.push(task);

          // Create reminder if due date/time is specified
          if (taskData.dueDate || taskData.dueTime) {
            const reminderTime = this.calculateReminderTime(
              taskData.dueDate,
              taskData.dueTime
            );
            if (reminderTime) {
              const reminder = await Reminder.create({
                taskId: task.id,
                userId: userId,
                reminderTime: reminderTime,
                reminderType: "push",
                title: `תזכורת: ${taskData.title}`,
                message: taskData.description || taskData.title,
                metadata: {
                  aiGenerated: true,
                },
              });
              createdItems.reminders.push(reminder);
            }
          }
        }
      }

      // Process shopping items
      if (results.shoppingItems && results.shoppingItems.length > 0) {
        const shoppingList = await this.getOrCreateList(
          userId,
          "shopping",
          language
        );

        for (const itemData of results.shoppingItems) {
          const category = await this.getOrCreateCategory(itemData.category);

          const shoppingItem = await ShoppingItem.create({
            listId: shoppingList.id,
            userId: userId,
            productName: itemData.productName,
            quantity: itemData.quantity || 1,
            unit: itemData.unit || "pcs",
            categoryId: category?.id,
            metadata: {
              aiGenerated: true,
            },
          });

          createdItems.shoppingItems.push(shoppingItem);
        }
      }

      // Process appointments
      if (results.appointments && results.appointments.length > 0) {
        const appointmentsList = await this.getOrCreateList(
          userId,
          "appointments",
          language
        );

        for (const appointmentData of results.appointments) {
          const task = await Task.create({
            listId: appointmentsList.id,
            userId: userId,
            title: appointmentData.title,
            description: appointmentData.description,
            priority: "high",
            dueDate: this.parseDate(appointmentData.date),
            dueTime: appointmentData.time,
            metadata: {
              aiGenerated: true,
              location: appointmentData.location,
              type: "appointment",
            },
          });

          createdItems.tasks.push(task);

          // Create reminder for appointment
          const reminderTime = this.calculateReminderTime(
            appointmentData.date,
            appointmentData.time,
            15
          );
          if (reminderTime) {
            const reminder = await Reminder.create({
              taskId: task.id,
              userId: userId,
              reminderTime: reminderTime,
              reminderType: "push",
              title: `תזכורת פגישה: ${appointmentData.title}`,
              message: appointmentData.description || appointmentData.title,
              metadata: {
                aiGenerated: true,
                type: "appointment",
              },
            });
            createdItems.reminders.push(reminder);
          }
        }
      }

      return createdItems;
    } catch (error) {
      console.error("Error processing AI results:", error);
      throw error;
    }
  }

  /**
   * Get or create a list for the user
   */
  async getOrCreateList(userId, listType, language) {
    const listNames = {
      he: {
        tasks: "משימות",
        shopping: "קניות",
        calls: "שיחות טלפון",
        meetings: "פגישות",
        appointments: "תורים",
        repairs: "תיקונים",
        ideas: "רעיונות",
      },
      en: {
        tasks: "Tasks",
        shopping: "Shopping",
        calls: "Phone Calls",
        meetings: "Meetings",
        appointments: "Appointments",
        repairs: "Repairs",
        ideas: "Ideas",
      },
    };

    const listIcons = {
      tasks: "mdi-checkbox-marked-circle-outline",
      shopping: "mdi-cart",
      calls: "mdi-phone",
      meetings: "mdi-calendar",
      appointments: "mdi-hospital",
      repairs: "mdi-wrench",
      ideas: "mdi-lightbulb",
    };

    const listColors = {
      tasks: "#E91E63",
      shopping: "#2196F3",
      calls: "#4CAF50",
      meetings: "#FF9800",
      appointments: "#9C27B0",
      repairs: "#F44336",
      ideas: "#FFC107",
    };

    let list = await List.findOne({
      where: {
        userId: userId,
        name: listNames[language][listType],
      },
    });

    if (!list) {
      list = await List.create({
        userId: userId,
        name: listNames[language][listType],
        description: `רשימת ${listNames[language][listType]}`,
        icon: listIcons[listType],
        color: listColors[listType],
        isDefault: true,
      });
    }

    return list;
  }

  /**
   * Get or create a category
   */
  async getOrCreateCategory(categoryName) {
    if (!categoryName) return null;

    let category = await Category.findOne({
      where: {
        name: categoryName,
      },
    });

    if (!category) {
      category = await Category.create({
        name: categoryName,
        isSystem: false,
        usageCount: 1,
      });
    } else {
      await category.increment("usageCount");
    }

    return category;
  }

  /**
   * Parse date string to Date object
   */
  parseDate(dateString) {
    if (!dateString) return null;

    // Handle relative dates
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateString.toLowerCase()) {
      case "today":
      case "היום":
        return today;
      case "tomorrow":
      case "מחר":
        return new Date(today.getTime() + 24 * 60 * 60 * 1000);
      case "this week":
      case "השבוע":
        return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(dateString);
    }
  }

  /**
   * Calculate reminder time
   */
  calculateReminderTime(dueDate, dueTime, minutesBefore = 15) {
    if (!dueDate) return null;

    const date = this.parseDate(dueDate);
    if (!date) return null;

    let reminderTime = new Date(date);

    if (dueTime) {
      const [hours, minutes] = dueTime.split(":");
      reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    // Subtract minutes before
    reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);

    return reminderTime;
  }

  /**
   * Translate text between languages
   */
  async translateText(text, fromLang, toLang) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Translate the following text from ${fromLang} to ${toLang}. Return only the translated text, no additional formatting.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("Translation error:", error);
      throw new Error("Failed to translate text");
    }
  }
}

export default new AIService();
