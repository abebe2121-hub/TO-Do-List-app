import { useEffect, useId, useState } from "react";
import Button from "../common/Button";
import {
  validateTask,
  TASK_PRIORITIES,
  TASK_CATEGORIES,
} from "../../services/validators.js";
import "./TaskForm.css";

const DEFAULT_CATEGORIES = [
  { label: "Personal", value: "personal" },
  { label: "Work", value: "work" },
  { label: "Study", value: "study" },
  { label: "Other", value: "other" },
];

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

function getInitialFormData(initialTask, categories) {
  const defaultCategory = categories.some(
    (category) => category.value === initialTask?.category,
  )
    ? initialTask.category
    : categories[0]?.value || "other";

  return {
    title: initialTask?.title ?? "",
    description: initialTask?.description ?? "",
    dueDate: initialTask?.dueDate ?? "",
    priority: initialTask?.priority ?? "medium",
    category: defaultCategory,
    // New tasks always start as pending.
    status: initialTask ? (initialTask.status ?? "pending") : "pending",
  };
}

function TaskForm({
  initialTask = null,
  onSubmit,
  onCancel,
  categories = DEFAULT_CATEGORIES,
  isSubmitting = false,
  submitLabel,
}) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;
  const dueDateId = `${generatedId}-due-date`;
  const priorityId = `${generatedId}-priority`;
  const categoryId = `${generatedId}-category`;

  const isEditMode = Boolean(initialTask);

  const [formData, setFormData] = useState(() =>
    getInitialFormData(initialTask, categories),
  );
  const [errors, setErrors] = useState({});

  // Reinitialize when switching to a different task or create/edit mode.
  // A change to the same task's object reference does not reset the form.
  useEffect(() => {
    setFormData(getInitialFormData(initialTask, categories));
    setErrors({});
  }, [initialTask?.id, isEditMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    // Clear the field's previous error while the user corrects it.
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
      form: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const trimmedTitle = formData.title.trim();

    if (!trimmedTitle) {
      nextErrors.title = "Please enter a task title.";
    } else if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      nextErrors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
    }

    if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      nextErrors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`;
    }

    if (!["low", "medium", "high"].includes(formData.priority)) {
      nextErrors.priority = "Please select a valid priority.";
    }

    if (!categories.some((category) => category.value === formData.category)) {
      nextErrors.category = "Please select a valid category.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) return;

    if (typeof onSubmit !== "function") {
      setErrors({
        form: "The form cannot be submitted because no onSubmit callback was provided.",
      });
      return;
    }

    const taskData = {
      ...(initialTask?.id !== undefined ? { id: initialTask.id } : {}),
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate,
      priority: formData.priority,
      category: formData.category,
      // Prevent creating completed tasks through the new-task form.
      status: isEditMode ? formData.status || "pending" : "pending",
    };

    try {
      await onSubmit(taskData);
    } catch (error) {
      // Let the user correct or retry without losing their input.
      setErrors({
        form: error?.message || "Unable to save the task. Please try again.",
      });
    }
  };

  const finalSubmitLabel =
    submitLabel || (isEditMode ? "Save Changes" : "Add Task");

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="task-form__heading">
        <h2 className="task-form__title">
          {isEditMode ? "Edit Task" : "Create a New Task"}
        </h2>
        <p className="task-form__subtitle">
          {isEditMode
            ? "Update the details of your task."
            : "Add a task to organize what you need to do."}
        </p>
      </div>

      <div className="task-form__group">
        <label className="task-form__label" htmlFor={titleId}>
          Task title <span aria-hidden="true">*</span>
        </label>

        <input
          id={titleId}
          className={`task-form__input ${
            errors.title ? "task-form__input--error" : ""
          }`}
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Complete assignment"
          maxLength={MAX_TITLE_LENGTH}
          required
          autoComplete="off"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={
            errors.title ? `${titleId}-error` : `${titleId}-help`
          }
          disabled={isSubmitting}
        />

        {errors.title ? (
          <p className="task-form__error" id={`${titleId}-error`} role="alert">
            {errors.title}
          </p>
        ) : (
          <p className="task-form__help" id={`${titleId}-help`}>
            Maximum {MAX_TITLE_LENGTH} characters.
          </p>
        )}
      </div>

      <div className="task-form__group">
        <label className="task-form__label" htmlFor={descriptionId}>
          Description
        </label>

        <textarea
          id={descriptionId}
          className={`task-form__textarea ${
            errors.description ? "task-form__input--error" : ""
          }`}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add more details about this task (optional)"
          rows={4}
          maxLength={MAX_DESCRIPTION_LENGTH}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description
              ? `${descriptionId}-error`
              : `${descriptionId}-help`
          }
          disabled={isSubmitting}
        />

        {errors.description ? (
          <p
            className="task-form__error"
            id={`${descriptionId}-error`}
            role="alert"
          >
            {errors.description}
          </p>
        ) : (
          <p className="task-form__help" id={`${descriptionId}-help`}>
            {formData.description.length}/{MAX_DESCRIPTION_LENGTH} characters
          </p>
        )}
      </div>

      <div className="task-form__row">
        <div className="task-form__group">
          <label className="task-form__label" htmlFor={dueDateId}>
            Due date
          </label>

          <input
            id={dueDateId}
            className="task-form__input"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            aria-describedby={`${dueDateId}-help`}
            disabled={isSubmitting}
          />

          <p className="task-form__help" id={`${dueDateId}-help`}>
            Optional deadline.
          </p>
        </div>

        <div className="task-form__group">
          <label className="task-form__label" htmlFor={priorityId}>
            Priority
          </label>

          <select
            id={priorityId}
            className={`task-form__select ${
              errors.priority ? "task-form__input--error" : ""
            }`}
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            aria-invalid={Boolean(errors.priority)}
            aria-describedby={
              errors.priority ? `${priorityId}-error` : undefined
            }
            disabled={isSubmitting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {errors.priority && (
            <p
              className="task-form__error"
              id={`${priorityId}-error`}
              role="alert"
            >
              {errors.priority}
            </p>
          )}
        </div>
      </div>

      <div className="task-form__group">
        <label className="task-form__label" htmlFor={categoryId}>
          Category
        </label>

        <select
          id={categoryId}
          className={`task-form__select ${
            errors.category ? "task-form__input--error" : ""
          }`}
          name="category"
          value={formData.category}
          onChange={handleChange}
          aria-invalid={Boolean(errors.category)}
          aria-describedby={errors.category ? `${categoryId}-error` : undefined}
          disabled={isSubmitting || categories.length === 0}
        >
          {categories.length === 0 ? (
            <option value="">No categories available</option>
          ) : (
            categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))
          )}
        </select>

        {errors.category && (
          <p
            className="task-form__error"
            id={`${categoryId}-error`}
            role="alert"
          >
            {errors.category}
          </p>
        )}
      </div>

      {isEditMode && (
        <div className="task-form__group">
          <label className="task-form__label" htmlFor={`${generatedId}-status`}>
            Status
          </label>

          <select
            id={`${generatedId}-status`}
            className="task-form__select"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <p className="task-form__help">
            Status can be changed when editing an existing task.
          </p>
        </div>
      )}

      {errors.form && (
        <p className="task-form__form-error" role="alert">
          {errors.form}
        </p>
      )}

      <div className="task-form__actions">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting || categories.length === 0}
        >
          {isSubmitting ? "Saving..." : finalSubmitLabel}
        </Button>
      </div>
    </form>
  );
}

export default TaskForm;
