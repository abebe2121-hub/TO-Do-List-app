import TaskItem from "./TaskItem";
import "./TaskList.css";

function TaskList({
  tasks = [],
  onToggleComplete,
  onEdit,
  onDelete,
  isLoading = false,
  deletingTaskId = null,
  emptyTitle = "No tasks yet",
  emptyMessage = "Your task list is empty. Add a task when you are ready to get started.",
}) {
  // Defensive check: the component expects an array of tasks.
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  if (isLoading) {
    return (
      <section
        className="task-list__loading"
        role="status"
        aria-live="polite"
        aria-label="Loading tasks"
      >
        <span className="task-list__spinner" aria-hidden="true" />
        <p>Loading your tasks...</p>
      </section>
    );
  }

  if (safeTasks.length === 0) {
    return (
      <section className="task-list__empty" aria-live="polite">
        <div className="task-list__empty-icon" aria-hidden="true">
          ✓
        </div>

        <h2 className="task-list__empty-title">{emptyTitle}</h2>

        <p className="task-list__empty-message">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section
      className="task-list"
      aria-label="Your tasks"
      aria-busy={isLoading}
    >
      <div className="task-list__items">
        {safeTasks.map((task) => {
          // Skip malformed entries that cannot be rendered as task objects.
          if (!task || typeof task !== "object") {
            return null;
          }

          if (task.id === undefined || task.id === null) {
            console.warn(
              "TaskList: A task is missing its id. Each task should have a unique id.",
              task,
            );
            return null;
          }

          return (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={task.id === deletingTaskId}
            />
          );
        })}
      </div>
    </section>
  );
}

export default TaskList;
