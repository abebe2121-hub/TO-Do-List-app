const db = require("../config/db");

// Allowed task fields that can be updated.
const ALLOWED_UPDATE_FIELDS = [
  "title",
  "description",
  "completed",
  "priority",
  "due_date",
];

const ALLOWED_PRIORITIES = ["low", "medium", "high"];

/**
 * Create a task for a specific user.
 * Returns the new task ID.
 */
async function createTask(userId, taskData) {
  const {
    title,
    description = null,
    priority = "medium",
    due_date = null,
  } = taskData;

  if (!ALLOWED_PRIORITIES.includes(priority)) {
    throw new Error("Invalid task priority.");
  }

  const sql = `
    INSERT INTO tasks
      (user_id, title, description, priority, due_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await db
    .promise()
    .execute(sql, [userId, title, description, priority, due_date]);

  return result.insertId;
}

/**
 * Get tasks belonging to a specific user.
 * Optional filters: completed and priority.
 * Returns newest tasks first.
 */
async function getTasksByUserId(userId, filters = {}) {
  const conditions = ["user_id = ?"];
  const params = [userId];

  if (filters.completed !== undefined) {
    let completed;

    if (
      filters.completed === true ||
      filters.completed === 1 ||
      filters.completed === "1" ||
      filters.completed === "true"
    ) {
      completed = 1;
    } else if (
      filters.completed === false ||
      filters.completed === 0 ||
      filters.completed === "0" ||
      filters.completed === "false"
    ) {
      completed = 0;
    } else {
      throw new Error("Invalid completed filter.");
    }

    conditions.push("completed = ?");
    params.push(completed);
  }

  if (filters.priority !== undefined) {
    if (!ALLOWED_PRIORITIES.includes(filters.priority)) {
      throw new Error("Invalid priority filter.");
    }

    conditions.push("priority = ?");
    params.push(filters.priority);
  }

  const sql = `
    SELECT
      id,
      user_id,
      title,
      description,
      completed,
      priority,
      due_date,
      created_at,
      updated_at
    FROM tasks
    WHERE ${conditions.join(" AND ")}
    ORDER BY created_at DESC, id DESC
  `;

  const [rows] = await db.promise().execute(sql, params);

  return rows;
}

/**
 * Find a task only if it belongs to the specified user.
 * Returns the task or null.
 */
async function getTaskById(taskId, userId) {
  const sql = `
    SELECT
      id,
      user_id,
      title,
      description,
      completed,
      priority,
      due_date,
      created_at,
      updated_at
    FROM tasks
    WHERE id = ? AND user_id = ?
    LIMIT 1
  `;

  const [rows] = await db.promise().execute(sql, [taskId, userId]);

  return rows.length > 0 ? rows[0] : null;
}

/**
 * Update supplied, permitted fields of a user's task.
 * Returns true if a row changed, otherwise false.
 */
async function updateTask(taskId, userId, taskData) {
  const fields = [];
  const params = [];

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(taskData, field)) {
      fields.push(field);
      params.push(taskData[field]);
    }
  }

  if (fields.length === 0) {
    throw new Error("No valid task fields were provided.");
  }

  if (
    Object.prototype.hasOwnProperty.call(taskData, "priority") &&
    !ALLOWED_PRIORITIES.includes(taskData.priority)
  ) {
    throw new Error("Invalid task priority.");
  }

  if (Object.prototype.hasOwnProperty.call(taskData, "completed")) {
    if (
      taskData.completed !== true &&
      taskData.completed !== false &&
      taskData.completed !== 1 &&
      taskData.completed !== 0
    ) {
      throw new Error("Completed must be a boolean value.");
    }
  }

  // Column names come only from the whitelist above.
  // All field values and IDs use parameter placeholders.
  const setClause = fields.map((field) => `\`${field}\` = ?`).join(", ");

  const sql = `
    UPDATE tasks
    SET ${setClause}
    WHERE id = ? AND user_id = ?
  `;

  params.push(taskId, userId);

  const [result] = await db.promise().execute(sql, params);

  return result.affectedRows > 0;
}

/**
 * Delete a task only when it belongs to the specified user.
 * Returns true if a row was deleted, otherwise false.
 */
async function deleteTask(taskId, userId) {
  const sql = `
    DELETE FROM tasks
    WHERE id = ? AND user_id = ?
  `;

  const [result] = await db.promise().execute(sql, [taskId, userId]);

  return result.affectedRows > 0;
}

/**
 * Get task counts for one user only.
 */
async function getTaskStats(userId) {
  const sql = `
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(completed = 1), 0) AS completed,
      COALESCE(SUM(completed = 0), 0) AS pending
    FROM tasks
    WHERE user_id = ?
  `;

  const [rows] = await db.promise().execute(sql, [userId]);

  return {
    total: Number(rows[0].total),
    completed: Number(rows[0].completed),
    pending: Number(rows[0].pending),
  };
}

module.exports = {
  createTask,
  getTasksByUserId,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
};
