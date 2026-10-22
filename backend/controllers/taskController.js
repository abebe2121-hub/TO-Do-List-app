const taskModel = require("../models/taskModel");

// Check that the request has an authenticated user.
function getAuthenticatedUserId(req, res) {
  const userId = req.user && req.user.id;

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });

    return null;
  }

  return userId;
}

// Validate task IDs received from the URL.
function getValidatedTaskId(req, res) {
  const rawId = req.params.taskId ?? req.params.id;

  if (typeof rawId !== "string" || !/^[1-9]\d*$/.test(rawId)) {
    res.status(400).json({
      success: false,
      message: "A valid task ID is required.",
    });

    return null;
  }

  const taskId = Number(rawId);

  if (!Number.isSafeInteger(taskId)) {
    res.status(400).json({
      success: false,
      message: "A valid task ID is required.",
    });

    return null;
  }

  return taskId;
}

// A. Create a task for the authenticated user.
async function createTask(req, res, next) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (userId === null) return;

    const { title, description, priority, due_date } = req.body;

    const taskData = {
      title,
      description,
      priority,
      due_date,
    };

    // The owner always comes from the verified JWT, not the request body.
    const newTaskId = await taskModel.createTask(userId, taskData);

    // Fetch the created task using both its ID and its owner's ID.
    const task = await taskModel.getTaskById(newTaskId, userId);

    if (!task) {
      return res.status(500).json({
        success: false,
        message: "The task was created, but could not be retrieved.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      task,
    });
  } catch (error) {
    return next(error);
  }
}

// B. Get tasks belonging only to the authenticated user.
async function getTasks(req, res, next) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (userId === null) return;

    // These filters should be validated by taskValidator in taskRoutes.js.
    // Search and pagination are omitted because the existing model
    // does not implement them.
    const filters = {};

    if (req.query.completed !== undefined) {
      filters.completed = req.query.completed;
    }

    if (req.query.priority !== undefined) {
      filters.priority = req.query.priority;
    }

    const tasks = await taskModel.getTasksByUserId(userId, filters);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    return next(error);
  }
}

// C. Get one task, ensuring that it belongs to the authenticated user.
async function getTaskById(req, res, next) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (userId === null) return;

    const taskId = getValidatedTaskId(req, res);
    if (taskId === null) return;

    const task = await taskModel.getTaskById(taskId, userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    return next(error);
  }
}

// D. Update an existing task owned by the authenticated user.
async function updateTask(req, res, next) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (userId === null) return;

    const taskId = getValidatedTaskId(req, res);
    if (taskId === null) return;

    // Check ownership before attempting the update.
    const existingTask = await taskModel.getTaskById(taskId, userId);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Accept only fields supported by the task model.
    const allowedFields = [
      "title",
      "description",
      "completed",
      "priority",
      "due_date",
    ];

    const taskData = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        taskData[field] = req.body[field];
      }
    }

    if (Object.keys(taskData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one supported field to update.",
      });
    }

    const updated = await taskModel.updateTask(taskId, userId, taskData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Task not found or no update was applied.",
      });
    }

    const updatedTask = await taskModel.getTaskById(taskId, userId);

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    return next(error);
  }
}

// E. Delete a task owned by the authenticated user.
async function deleteTask(req, res, next) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (userId === null) return;

    const taskId = getValidatedTaskId(req, res);
    if (taskId === null) return;

    const deleted = await taskModel.deleteTask(taskId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
}

// F. Get task statistics for the authenticated user.
async function getTaskStats(req, res, next) {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (userId === null) return;

    const stats = await taskModel.getTaskStats(userId);

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
};
