const ALLOWED_PRIORITIES = ["low", "medium", "high"];

const ALLOWED_TASK_FIELDS = [
  "title",
  "description",
  "completed",
  "priority",
  "due_date",
];

const MAX_DESCRIPTION_LENGTH = 5000;

// Send a consistent HTTP 400 response.
function sendValidationError(res, errors) {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });
}

// Ensure the request body is a plain JSON-style object.
function isValidBody(body) {
  return body !== null && typeof body === "object" && !Array.isArray(body);
}

// Check a date strictly in YYYY-MM-DD format.
// Also rejects impossible dates such as 2026-02-30.
function isValidDate(value) {
  if (typeof value !== "string") {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1000 || year > 9999) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// Validate optional description values.
function validateDescription(value, errors) {
  if (typeof value !== "string") {
    errors.push("Description must be a string.");
    return;
  }

  if (value.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(
      `Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters.`,
    );
  }
}

// Validate optional priority values.
function validatePriority(value, errors) {
  if (!ALLOWED_PRIORITIES.includes(value)) {
    errors.push("Priority must be low, medium, or high.");
  }
}

// Validate optional due_date values.
// null means the user wants no due date.
function validateDueDate(value, errors) {
  if (value !== null && !isValidDate(value)) {
    errors.push("Due date must be a valid date in YYYY-MM-DD format or null.");
  }
}

/**
 * Validate a new task.
 *
 * completed is intentionally not accepted during creation.
 * New tasks start incomplete by default in the database.
 */
function validateCreateTask(req, res, next) {
  if (!isValidBody(req.body)) {
    return sendValidationError(res, [
      "Request body must be a valid JSON object.",
    ]);
  }

  const errors = [];
  const body = req.body;

  // Reject properties that are not allowed for task creation.
  const unsupportedFields = Object.keys(body).filter(
    (field) =>
      !["title", "description", "priority", "due_date"].includes(field),
  );

  if (unsupportedFields.length > 0) {
    errors.push(`Unsupported fields: ${unsupportedFields.join(", ")}.`);
  }

  // Title is required.
  if (typeof body.title !== "string") {
    errors.push("Task title is required and must be a string.");
  } else {
    body.title = body.title.trim();

    if (body.title.length === 0) {
      errors.push("Task title cannot be empty.");
    } else if (body.title.length > 255) {
      errors.push("Task title must not exceed 255 characters.");
    }
  }

  if (Object.hasOwn(body, "description")) {
    if (body.description !== "") {
      validateDescription(body.description, errors);
    } else {
      // Normalize an empty description to an empty string.
      body.description = "";
    }
  }

  if (Object.hasOwn(body, "priority")) {
    validatePriority(body.priority, errors);
  }

  if (Object.hasOwn(body, "due_date")) {
    validateDueDate(body.due_date, errors);
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  return next();
}

/**
 * Validate partial task updates.
 * Only whitelisted fields may be updated.
 */
function validateUpdateTask(req, res, next) {
  if (!isValidBody(req.body)) {
    return sendValidationError(res, [
      "Request body must be a valid JSON object.",
    ]);
  }

  const errors = [];
  const body = req.body;
  const suppliedFields = Object.keys(body);

  if (suppliedFields.length === 0) {
    errors.push("Provide at least one field to update.");
  }

  const unsupportedFields = suppliedFields.filter(
    (field) => !ALLOWED_TASK_FIELDS.includes(field),
  );

  if (unsupportedFields.length > 0) {
    errors.push(`Unsupported fields: ${unsupportedFields.join(", ")}.`);
  }

  if (Object.hasOwn(body, "title")) {
    if (typeof body.title !== "string") {
      errors.push("Task title must be a string.");
    } else {
      body.title = body.title.trim();

      if (body.title.length === 0) {
        errors.push("Task title cannot be empty.");
      } else if (body.title.length > 255) {
        errors.push("Task title must not exceed 255 characters.");
      }
    }
  }

  if (Object.hasOwn(body, "description")) {
    if (body.description !== null && body.description !== "") {
      validateDescription(body.description, errors);
    }
  }

  if (Object.hasOwn(body, "completed")) {
    if (typeof body.completed !== "boolean") {
      errors.push("Completed must be a Boolean: true or false.");
    }
  }

  if (Object.hasOwn(body, "priority")) {
    validatePriority(body.priority, errors);
  }

  if (Object.hasOwn(body, "due_date")) {
    validateDueDate(body.due_date, errors);
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  return next();
}

/**
 * Validate task list query filters.
 * Normalize completed to a Boolean.
 */
function validateTaskFilters(req, res, next) {
  const errors = [];
  const query = req.query;

  const allowedFilters = ["completed", "priority"];
  const unsupportedFilters = Object.keys(query).filter(
    (field) => !allowedFilters.includes(field),
  );

  if (unsupportedFilters.length > 0) {
    errors.push(`Unsupported filters: ${unsupportedFilters.join(", ")}.`);
  }

  if (Object.hasOwn(query, "completed")) {
    if (query.completed === "true") {
      query.completed = true;
    } else if (query.completed === "false") {
      query.completed = false;
    } else {
      errors.push("Completed filter must be true or false.");
    }
  }

  if (Object.hasOwn(query, "priority")) {
    if (!ALLOWED_PRIORITIES.includes(query.priority)) {
      errors.push("Priority filter must be low, medium, or high.");
    }
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  return next();
}

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateTaskFilters,
};
