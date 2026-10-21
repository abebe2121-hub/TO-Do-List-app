import Button from "../common/Button";
import "./TaskItem.css";

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const CATEGORY_LABELS = {
  personal: "Personal",
  work: "Work",
  study: "Study",
  other: "Other",
};

function formatDueDate(dateValue) {
  if (!dateValue || typeof dateValue !== "string") {
    return null;
  }

  // Accept date-only values in YYYY-MM-DD format.
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);

  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    // Reject invalid calendar dates such as February 31.
    if (
      date.getFullYear() !== Number(year) ||
      date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day)
    ) {
      return null;
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Handle valid date-time strings if the backend later provides them.
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isPastDue(dateValue) {
  if (!dateValue || typeof dateValue !== "string") {
    return false;
  }

  // Compare date-only values using local calendar dates.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  let dueDate;

  if (match) {
    const [, year, month, day] = match;

    dueDate = new Date(Number(year), Number(month) - 1, Number(day));

    if (
      dueDate.getFullYear() !== Number(year) ||
      dueDate.getMonth() !== Number(month) - 1 ||
      dueDate.getDate() !== Number(day)
    ) {
      return false;
    }
  } else {
    dueDate = new Date(dateValue);

    if (Number.isNaN(dueDate.getTime())) {
      return false;
    }

    dueDate = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate(),
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate < today;
}

function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  isDeleting = false,
}) {
  // Avoid crashing if a task has not loaded or is missing.
  if (!task || typeof task !== "object") {
    return null;
  }

  const taskId = task.id;
  const title =
    typeof task.title === "string" && task.title.trim()
      ? task.title.trim()
      : "Untitled task";

  const description =
    typeof task.description === "string" ? task.description.trim() : "";

  const priority =
    typeof task.priority === "string" ? task.priority.toLowerCase() : "medium";

  const category =
    typeof task.category === "string" ? task.category.toLowerCase() : "other";

  const status =
    typeof task.status === "string" ? task.status.toLowerCase() : "pending";

  const isCompleted = status === "completed" || task.completed === true;

  const isOverdue = !isCompleted && isPastDue(task.dueDate);

  const formattedDueDate = formatDueDate(task.dueDate);

  const priorityLabel = PRIORITY_LABELS[priority] || "Medium";

  const categoryLabel =
    CATEGORY_LABELS[category] ||
    (category ? category.charAt(0).toUpperCase() + category.slice(1) : "Other");

  const statusLabel = isCompleted
    ? "Completed"
    : status === "in_progress"
      ? "In progress"
      : "Pending";

  const handleToggle = () => {
    if (taskId === undefined || taskId === null) return;
    onToggleComplete?.(taskId);
  };

  const handleEdit = () => {
    if (taskId === undefined || taskId === null) return;
    onEdit?.(task);
  };

  const handleDelete = () => {
    if (taskId === undefined || taskId === null || isDeleting) {
      return;
    }

    onDelete?.(taskId);
  };

  const cardClasses = [
    "task-item",
    isCompleted ? "task-item--completed" : "",
    isOverdue ? "task-item--overdue" : "",
    isDeleting ? "task-item--deleting" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClasses}>
      <div className="task-item__main">
        <label className="task-item__checkbox-label">
          <input
            className="task-item__checkbox"
            type="checkbox"
            checked={isCompleted}
            onChange={handleToggle}
            disabled={isDeleting || taskId === undefined || taskId === null}
            aria-label={`Mark "${title}" as ${
              isCompleted ? "pending" : "completed"
            }`}
          />
          <span className="task-item__checkbox-visual" aria-hidden="true" />
        </label>

        <div className="task-item__content">
          <div className="task-item__title-row">
            <h3 className="task-item__title">{title}</h3>

            {isOverdue && (
              <span className="task-item__overdue-badge">Overdue</span>
            )}
          </div>

          <p
            className={`task-item__description ${
              description ? "" : "task-item__description--empty"
            }`}
          >
            {description || "No description provided."}
          </p>

          <div className="task-item__metadata">
            <span
              className={`task-item__badge task-item__priority task-item__priority--${
                PRIORITY_LABELS[priority] ? priority : "medium"
              }`}
            >
              <span aria-hidden="true">●</span>
              {priorityLabel} priority
            </span>

            <span className="task-item__badge task-item__category">
              {categoryLabel}
            </span>

            <span
              className={`task-item__badge task-item__status task-item__status--${
                isCompleted
                  ? "completed"
                  : status === "in_progress"
                    ? "in-progress"
                    : "pending"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <div
            className={`task-item__due-date ${
              isOverdue ? "task-item__due-date--overdue" : ""
            }`}
          >
            <span aria-hidden="true">▦</span>
            <span>
              {formattedDueDate ? `Due ${formattedDueDate}` : "No due date"}
            </span>
          </div>
        </div>
      </div>

      <div className="task-item__actions">
        <Button
          type="button"
          variant="outline"
          size="small"
          onClick={handleEdit}
          disabled={isDeleting || taskId === undefined || taskId === null}
          aria-label={`Edit task: ${title}`}
        >
          Edit
        </Button>

        <Button
          type="button"
          variant="danger"
          size="small"
          onClick={handleDelete}
          disabled={isDeleting || taskId === undefined || taskId === null}
          loading={isDeleting}
          aria-label={`Delete task: ${title}`}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </article>
  );
}

export default TaskItem;
