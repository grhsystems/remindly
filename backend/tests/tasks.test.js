import request from "supertest";
import app from "../server.js";
import { User } from "../models/User.js";
import { Task } from "../models/Task.js";
import { List } from "../models/List.js";
import { sequelize } from "../config/database.js";

describe("Task Routes", () => {
  let authToken;
  let testList;

  beforeAll(async () => {
    // Sync database before tests
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up data before each test
    await Task.destroy({ where: {} });
    await List.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create a test user and get token
    const userData = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      language: "he",
    };

    const userResponse = await request(app)
      .post("/api/auth/register")
      .send(userData);

    authToken = userResponse.body.token;

    // Create a test list
    const listData = {
      name: "Test List",
      description: "Test Description",
      icon: "mdi-list",
      color: "#1976d2",
    };

    const listResponse = await request(app)
      .post("/api/lists")
      .set("Authorization", `Bearer ${authToken}`)
      .send(listData);

    testList = listResponse.body.data;
  });

  describe("POST /api/tasks", () => {
    it("should create a new task successfully", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        listId: testList.id,
        priority: "medium",
        dueDate: "2024-12-31",
        dueTime: "10:00",
      };

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.listId).toBe(taskData.listId);
      expect(response.body.data.priority).toBe(taskData.priority);
    });

    it("should not create task without authentication", async () => {
      const taskData = {
        title: "Test Task",
        listId: testList.id,
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(taskData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("required");
    });

    it("should validate priority values", async () => {
      const taskData = {
        title: "Test Task",
        listId: testList.id,
        priority: "invalid",
      };

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("priority");
    });
  });

  describe("GET /api/tasks", () => {
    beforeEach(async () => {
      // Create test tasks
      const tasks = [
        {
          title: "Task 1",
          description: "Description 1",
          listId: testList.id,
          priority: "high",
          completed: false,
        },
        {
          title: "Task 2",
          description: "Description 2",
          listId: testList.id,
          priority: "medium",
          completed: true,
        },
      ];

      for (const taskData of tasks) {
        await request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
          .send(taskData);
      }
    });

    it("should get all tasks", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it("should filter tasks by completed status", async () => {
      const response = await request(app)
        .get("/api/tasks?completed=true")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].completed).toBe(true);
    });

    it("should filter tasks by priority", async () => {
      const response = await request(app)
        .get("/api/tasks?priority=high")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].priority).toBe("high");
    });

    it("should not get tasks without authentication", async () => {
      const response = await request(app).get("/api/tasks").expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    let testTask;

    beforeEach(async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        listId: testList.id,
        priority: "medium",
      };

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send(taskData);

      testTask = response.body.data;
    });

    it("should update task successfully", async () => {
      const updateData = {
        title: "Updated Task",
        description: "Updated Description",
        priority: "high",
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.priority).toBe(updateData.priority);
    });

    it("should not update task without authentication", async () => {
      const updateData = {
        title: "Updated Task",
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should not update non-existent task", async () => {
      const updateData = {
        title: "Updated Task",
      };

      const response = await request(app)
        .put("/api/tasks/non-existent-id")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /api/tasks/:id/complete", () => {
    let testTask;

    beforeEach(async () => {
      const taskData = {
        title: "Test Task",
        listId: testList.id,
        priority: "medium",
      };

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send(taskData);

      testTask = response.body.data;
    });

    it("should toggle task completion", async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testTask.id}/complete`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ completed: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.completed).toBe(true);
    });

    it("should not toggle task without authentication", async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testTask.id}/complete`)
        .send({ completed: true })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    let testTask;

    beforeEach(async () => {
      const taskData = {
        title: "Test Task",
        listId: testList.id,
        priority: "medium",
      };

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send(taskData);

      testTask = response.body.data;
    });

    it("should delete task successfully", async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should not delete task without authentication", async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should not delete non-existent task", async () => {
      const response = await request(app)
        .delete("/api/tasks/non-existent-id")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
