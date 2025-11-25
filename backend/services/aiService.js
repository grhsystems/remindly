import OpenAI from "openai";
import { logger } from "../utils/logger.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Parse task from natural language text
 * @param {string} text - User input text
 * @param {string} language - Language code (he/en)
 * @returns {Promise<Object>} Parsed task data
 */
export const parseTaskFromText = async (text, language = "he") => {
  try {
    const systemPrompt =
      language === "he"
        ? `אתה עוזר AI שמנתח טקסט חופשי ומחלץ מידע על משימות.
נתח את הטקסט הבא וזהה:
- סוג המשימה (task/shopping/call/meeting/doctor/repair/general)
- כותרת המשימה
- תיאור (אם יש)
- תאריך ושעה (אם יש)
- עדיפות (low/medium/high/urgent)
- שם איש קשר (אם יש)
- רשימת פריטים לקנייה (אם יש)

החזר תשובה בפורמט JSON בלבד, ללא טקסט נוסף.`
        : `You are an AI assistant that analyzes free text and extracts task information.
Analyze the following text and identify:
- Task type (task/shopping/call/meeting/doctor/repair/general)
- Task title
- Description (if any)
- Date and time (if any)
- Priority (low/medium/high/urgent)
- Contact name (if any)
- Shopping items list (if any)

Return response in JSON format only, without additional text.`;

    const userPrompt =
      language === "he"
        ? `נתח את הטקסט הבא וחלץ מידע:

"${text}"

פורמט התשובה:
{
  "type": "task|shopping|call|meeting|doctor|repair|general",
  "title": "כותרת המשימה",
  "description": "תיאור מפורט",
  "dueDate": "YYYY-MM-DD או null",
  "dueTime": "HH:MM או null",
  "priority": "low|medium|high|urgent",
  "contactName": "שם איש קשר או null",
  "items": ["פריט 1", "פריט 2"] או null,
  "reminderBefore": מספר דקות לתזכורת או null
}`
        : `Analyze the following text and extract information:

"${text}"

Response format:
{
  "type": "task|shopping|call|meeting|doctor|repair|general",
  "title": "Task title",
  "description": "Detailed description",
  "dueDate": "YYYY-MM-DD or null",
  "dueTime": "HH:MM or null",
  "priority": "low|medium|high|urgent",
  "contactName": "Contact name or null",
  "items": ["Item 1", "Item 2"] or null,
  "reminderBefore": number of minutes or null
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    logger.info("AI parsed task successfully", { text, result });
    return result;
  } catch (error) {
    logger.error("AI parse task error:", error);
    throw new Error("Failed to parse task from text");
  }
};

/**
 * Translate text between languages
 * @param {string} text - Text to translate
 * @param {string} from - Source language
 * @param {string} to - Target language
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, from = "he", to = "en") => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text from ${from} to ${to}. Return only the translated text, nothing else.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });

    const translated = completion.choices[0].message.content.trim();
    logger.info("AI translated text successfully", {
      text,
      translated,
      from,
      to,
    });
    return translated;
  } catch (error) {
    logger.error("AI translate error:", error);
    throw new Error("Failed to translate text");
  }
};

/**
 * Generate task suggestions based on context
 * @param {Array} existingTasks - User's existing tasks
 * @param {string} language - Language code
 * @returns {Promise<Array>} Task suggestions
 */
export const generateTaskSuggestions = async (
  existingTasks,
  language = "he"
) => {
  try {
    const tasksContext = existingTasks
      .map((t) => `${t.title}: ${t.description || ""}`)
      .join("\n");

    const systemPrompt =
      language === "he"
        ? "אתה עוזר AI שמציע משימות רלוונטיות על סמך המשימות הקיימות של המשתמש."
        : "You are an AI assistant that suggests relevant tasks based on user's existing tasks.";

    const userPrompt =
      language === "he"
        ? `בהתבסס על המשימות הקיימות הבאות, הצע 3 משימות נוספות שעשויות להיות רלוונטיות:

${tasksContext}

החזר מערך JSON עם 3 הצעות משימות בפורמט:
[
  {
    "title": "כותרת המשימה",
    "description": "תיאור",
    "priority": "low|medium|high"
  }
]`
        : `Based on the following existing tasks, suggest 3 additional relevant tasks:

${tasksContext}

Return JSON array with 3 task suggestions in format:
[
  {
    "title": "Task title",
    "description": "Description",
    "priority": "low|medium|high"
  }
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const suggestions = JSON.parse(completion.choices[0].message.content);
    logger.info("AI generated task suggestions", { count: suggestions.length });
    return suggestions;
  } catch (error) {
    logger.error("AI generate suggestions error:", error);
    throw new Error("Failed to generate task suggestions");
  }
};

/**
 * Analyze task priority based on content and deadline
 * @param {Object} task - Task object
 * @returns {Promise<string>} Priority level
 */
export const analyzePriority = async (task) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that analyzes task priority. Return only one word: low, medium, high, or urgent.",
        },
        {
          role: "user",
          content: `Analyze priority for this task:
Title: ${task.title}
Description: ${task.description || "None"}
Due Date: ${task.dueDate || "None"}
Due Time: ${task.dueTime || "None"}

Return priority level (low/medium/high/urgent):`,
        },
      ],
      temperature: 0.3,
    });

    const priority = completion.choices[0].message.content.trim().toLowerCase();
    logger.info("AI analyzed priority", { task: task.title, priority });
    return priority;
  } catch (error) {
    logger.error("AI analyze priority error:", error);
    return "medium"; // Default priority
  }
};

export default {
  parseTaskFromText,
  translateText,
  generateTaskSuggestions,
  analyzePriority,
};
