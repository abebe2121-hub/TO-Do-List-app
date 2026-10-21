/**
 * Reusable validation functions for the TaskFlow application.
 *
 * Individual validators:
 *   Return an error message when invalid, or '' when valid.
 *
 * Form validators:
 *   Return an object containing only fields with validation errors.
 *
 * Note:
 *   These checks improve user experience. The backend must validate
 *   all incoming data independently.
 */

// Allowed task values. Use these same values in TaskForm.jsx and the backend.
export const TASK_PRIORITIES = ["Low", "Medium", "High"];

export const TASK_CATEGORIES = ["Personal", "Work", "Study", "Other"];

const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 80;
const MAX_TASK_TITLE_LENGTH = 100;
const MAX_TASK_DESCRIPTION_LENGTH = 500;

/**
 * Validate an email address.
 *
 * This checks the format only. It cannot prove that the email exists.
 */
export function validateEmail(email) {
  if (typeof email !== "string" || !email.trim()) {
    return "Email is required.";
  }

  const normalizedEmail = email.trim();

  // A practical format check, not proof that the address exists.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return "Enter a valid email address.";
  }

  return "";
}

/**
 * Validate a password.
 *
 * Passwords are not trimmed because spaces can be intentional characters.
 * Change MIN_PASSWORD_LENGTH if the backend uses a different minimum.
 */
export function validatePassword(password) {
  if (typeof password !== "string" || password.length === 0) {
    return "Password is required.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }

  return "";
}

/**
 * Validate a person's name.
 *
 * Trimming is used only for validation. Names may contain spaces,
 * hyphens, apostrophes, and non-English characters.
 */
export function validateName(name) {
  if (typeof name !== "string" || !name.trim()) {
    return "Name is required.";
  }

  const normalizedName = name.trim();

  if (normalizedName.length < MIN_NAME_LENGTH) {
    return `Name must contain at least ${MIN_NAME_LENGTH} character.`;
  }

  if (normalizedName.length > MAX_NAME_LENGTH) {
    return `Name must not exceed ${MAX_NAME_LENGTH} characters.`;
  }

  return "";
}

/**
 * Check that the confirmation password is present and matches.
 */
export function validateConfirmPassword(password, confirmPassword) {
  if (typeof confirmPassword !== "string" || confirmPassword.length === 0) {
    return "Please confirm your password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

/**
 * Validate a date in YYYY-MM-DD format.
 *
 * This format is suitable for a standard HTML input type="date".
 * It checks the actual calendar date, not just the string format.
 */
function validateDueDate(dueDate) {
  if (dueDate === undefined || dueDate === null || dueDate === "") {
    return "";
  }

  if (typeof dueDate !== "string") {
    return "Due date must be a valid date.";
  }

  const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = dueDate.match(datePattern);

  if (!match) {
    return "Due date must use YYYY-MM-DD format.";
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isRealDate) {
    return "Enter a real calendar date.";
  }

  return "";
}

/**
 * Validate a task object.
 *
 * Expected fields:
 * {
 *   title: string,
 *   description?: string,
 *   dueDate?: string,
 *   priority: 'Low' | 'Medium' | 'High',
 *   category: 'Personal' | 'Work' | 'Study' | 'Other'
 * }
 *
 * Returns an object containing only invalid fields.
 * Does not modify taskData.
 */
export function validateTask(taskData) {
  const errors = {};

  if (!taskData || typeof taskData !== "object" || Array.isArray(taskData)) {
    return { form: "Task data must be a valid object." };
  }

  // Title: required, maximum 100 characters.
  if (typeof taskData.title !== "string" || !taskData.title.trim()) {
    errors.title = "Task title is required.";
  } else if (taskData.title.trim().length > MAX_TASK_TITLE_LENGTH) {
    errors.title = `Task title must not exceed ${MAX_TASK_TITLE_LENGTH} characters.`;
  }

  // Description: optional, maximum 500 characters.
  if (taskData.description !== undefined && taskData.description !== null) {
    if (typeof taskData.description !== "string") {
      errors.description = "Description must be text.";
    } else if (taskData.description.length > MAX_TASK_DESCRIPTION_LENGTH) {
      errors.description = `Description must not exceed ${MAX_TASK_DESCRIPTION_LENGTH} characters.`;
    }
  }

  // Due date: optional, but must be a real YYYY-MM-DD date if provided.
  const dueDateError = validateDueDate(taskData.dueDate);

  if (dueDateError) {
    errors.dueDate = dueDateError;
  }

  // Priority: must match one of the agreed values.
  if (!TASK_PRIORITIES.includes(taskData.priority)) {
    errors.priority = "Select Low, Medium, or High priority.";
  }

  // Category: must match one of the agreed values.
  if (!TASK_CATEGORIES.includes(taskData.category)) {
    errors.category = "Select Personal, Work, Study, or Other as the category.";
  }

  return errors;
}

/**
 * Validate the Login form.
 *
 * Returns {} when valid, or an object containing invalid fields.
 * Authentication itself must be performed by the backend.
 */
export function validateLoginForm(credentials) {
  const errors = {};

  if (
    !credentials ||
    typeof credentials !== "object" ||
    Array.isArray(credentials)
  ) {
    return { form: "Login data must be a valid object." };
  }

  const emailError = validateEmail(credentials.email);
  const passwordError = validatePassword(credentials.password);

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}

/**
 * Validate the Register form.
 *
 * Supports either `name` or `fullName` for the name field.
 * Confirm-password is validated here, but should normally not be
 * included in the backend registration payload.
 */
export function validateRegisterForm(formData) {
  const errors = {};

  if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
    return { form: "Registration data must be a valid object." };
  }

  const name = formData.fullName ?? formData.name;

  const nameError = validateName(name);
  const emailError = validateEmail(formData.email);
  const passwordError = validatePassword(formData.password);
  const confirmPasswordError = validateConfirmPassword(
    formData.password,
    formData.confirmPassword,
  );

  if (nameError) {
    // Use the field name that the current form actually has.
    const nameField = "fullName" in formData ? "fullName" : "name";
    errors[nameField] = nameError;
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError;
  }

  return errors;
}
