
import api from './api.js';

// Validate task IDs before sending requests.
function validateTaskId(taskId) {
  if (
    taskId === undefined ||
    taskId === null ||
    String(taskId).trim() === ''
  ) {
    throw new Error('Task ID is required.');
  }
}

// Validate task data before creating or updating a task.
function validateTaskData(taskData, requireTitle = false) {
  if (
    !taskData ||
    typeof taskData !== 'object' ||
    Array.isArray(taskData)
  ) {
    throw new Error('Task data must be a valid object.');
  }

  if (
    requireTitle &&
    (typeof taskData.title !== 'string' || !taskData.title.trim())
  ) {
    throw new Error('Task title is required.');
  }
}

// GET /api/tasks
export async function getTasks(params = {}) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    throw new Error('Task filters must be an object.');
  }

  const response = await api.get('/tasks', { params });
  return response.data;
}

// GET /api/tasks/:id
export async function getTaskById(taskId) {
  validateTaskId(taskId);

  const response = await api.get(
    `/tasks/${encodeURIComponent(String(taskId).trim())}`
  );

  return response.data;
}

// POST /api/tasks
export async function createTask(taskData) {
  validateTaskData(taskData, true);

  const response = await api.post('/tasks', taskData);
  return response.data;
}

// PUT /api/tasks/:id
export async function updateTask(taskId, taskData) {
  validateTaskId(taskId);
  validateTaskData(taskData);

  const response = await api.put(
    `/tasks/${encodeURIComponent(String(taskId).trim())}`,
    taskData
  );

  return response.data;
}

// DELETE /api/tasks/:id
export async function deleteTask(taskId) {
  validateTaskId(taskId);

  const response = await api.delete(
    `/tasks/${encodeURIComponent(String(taskId).trim())}`
  );

  return response.data;
}

// Update the task's status using the existing updateTask function.
export async function toggleTaskComplete(taskId, completed) {
  validateTaskId(taskId);

  if (typeof completed !== 'boolean') {
    throw new Error('The completed value must be true or false.');
  }

  // Backend schema: status must be "completed" or "pending".
  return updateTask(taskId, {
    status: completed ? 'completed' : 'pending',
  });
}
