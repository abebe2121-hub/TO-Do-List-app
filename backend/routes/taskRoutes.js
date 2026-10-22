const express = require("express");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  validateCreateTask,
  validateUpdateTask,
  validateTaskFilters,
} = require("../validators/taskValidator");

const router = express.Router();

// GET /api/tasks/stats
// Get statistics for the authenticated user's tasks.
// Keep this route before /:id.
router.get("/stats", authMiddleware, getTaskStats);

// POST /api/tasks
// Validate task data before creating a task.
router.post("/", authMiddleware, validateCreateTask, createTask);

// GET /api/tasks
// Validate filters before retrieving the user's tasks.
router.get("/", authMiddleware, validateTaskFilters, getTasks);

// GET /api/tasks/:id
// Retrieve one task belonging to the authenticated user.
router.get("/:id", authMiddleware, getTaskById);

// PUT /api/tasks/:id
// Validate update data before updating the user's task.
router.put("/:id", authMiddleware, validateUpdateTask, updateTask);

// DELETE /api/tasks/:id
// Delete only a task owned by the authenticated user.
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;
