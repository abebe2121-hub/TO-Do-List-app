import { useMemo, useRef, useState } from "react";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

import TaskForm from "../components/tasks/TaskForm";
import TaskList from "../components/tasks/TaskList";

import Modal from "../components/common/Modal";
import useTasks from "../hooks/useTasks";

import "./Home.css";

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Validate YYYY-MM-DD without converting the due date to UTC.
function isValidLocalDate(dateString) {
  if (typeof dateString !== "string") return false;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function Home() {
  const {
    tasks,
    filteredTasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    resetFilters,
  } = useTasks();

  // Page-specific UI state. Task data remains inside useTasks().
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  // Prevent repeated delete actions before React rerenders.
  const deleteInProgressRef = useRef(false);

  const isEditMode = selectedTask !== null;

  // Summary values always use the complete task collection.
  const summary = useMemo(() => {
    const today = getLocalDateString();

    const pending = tasks.filter((task) => task.status === "pending").length;

    const completed = tasks.filter(
      (task) => task.status === "completed",
    ).length;

    const overdue = tasks.filter((task) => {
      if (task.status === "completed") return false;
      if (!isValidLocalDate(task.dueDate)) return false;

      // YYYY-MM-DD strings can be compared as calendar dates.
      return task.dueDate < today;
    }).length;

    return {
      total: tasks.length,
      pending,
      completed,
      overdue,
    };
  }, [tasks]);

  const openCreateForm = () => {
    setSelectedTask(null);
    setActionError("");
    setIsTaskFormOpen(true);
  };

  const openEditForm = (task) => {
    setSelectedTask(task);
    setActionError("");
    setIsTaskFormOpen(true);
  };

  const closeTaskForm = () => {
    if (isSubmitting) return;

    setIsTaskFormOpen(false);
    setSelectedTask(null);
    setActionError("");
  };

  const handleTaskSubmit = async (formData) => {
    setIsSubmitting(true);
    setActionError("");

    try {
      const result = isEditMode
        ? updateTask(selectedTask.id, formData)
        : addTask(formData);

      if (!result?.success) {
        const message = result?.error || "Could not save the task.";
        setActionError(message);

        // TaskForm can catch this error and keep its current values.
        throw new Error(message);
      }

      setIsTaskFormOpen(false);
      setSelectedTask(null);

      return result.task;
    } catch (submitError) {
      setActionError(
        submitError.message || "Something went wrong while saving the task.",
      );
      throw submitError;
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirmation = (taskId) => {
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      setActionError("This task could not be found.");
      return;
    }

    setActionError("");
    setTaskToDelete(task);
  };

  const closeDeleteConfirmation = () => {
    if (isDeleting) return;
    setTaskToDelete(null);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete || deleteInProgressRef.current) return;

    deleteInProgressRef.current = true;
    setIsDeleting(true);
    setActionError("");

    try {
      const result = deleteTask(taskToDelete.id);

      if (!result?.success) {
        setActionError(result?.error || "Could not delete the task.");
        return;
      }

      setTaskToDelete(null);
    } catch {
      setActionError("Something went wrong while deleting the task.");
    } finally {
      deleteInProgressRef.current = false;
      setIsDeleting(false);
    }
  };

  const handleToggleComplete = (taskId) => {
    const result = toggleTaskComplete(taskId);

    if (!result?.success) {
      setActionError(result?.error || "Could not update the task status.");
    } else {
      setActionError("");
    }
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    categoryFilter !== "all" ||
    sortBy !== "newest";

  const emptyTitle =
    tasks.length === 0 ? "No tasks yet" : "No tasks match your filters";

  const emptyMessage =
    tasks.length === 0
      ? "Create your first task and start organizing your day."
      : "Try changing your search or filters to find your tasks.";

  return (
    <div className="home-page">
      <Header />

      <div className="home-layout">
        <aside className="home-sidebar" aria-label="Main navigation">
          <Sidebar />
        </aside>

        <div className="home-main-column">
          <main className="home-content">
            <section className="home-heading">
              <div className="home-heading__text">
                <p className="home-eyebrow">YOUR WORKSPACE</p>
                <h1 className="home-title">My Tasks</h1>
                <p className="home-description">
                  Plan your work, focus on your priorities, and get things done.
                </p>
              </div>

              <button
                className="home-add-button"
                type="button"
                onClick={openCreateForm}
              >
                <span aria-hidden="true">+</span>
                Add Task
              </button>
            </section>

            {error && (
              <div className="home-alert" role="alert">
                <strong>Storage notice:</strong> {error}
              </div>
            )}

            {actionError && (
              <div className="home-alert" role="alert">
                {actionError}
              </div>
            )}

            <section
              className="home-summary"
              aria-label="Task summary"
              aria-busy={loading}
            >
              <article className="home-summary-card home-summary-card--total">
                <div className="home-summary-card__icon" aria-hidden="true">
                  ▤
                </div>
                <div>
                  <p className="home-summary-card__label">Total Tasks</p>
                  <p className="home-summary-card__value">
                    {loading ? "—" : summary.total}
                  </p>
                </div>
              </article>

              <article className="home-summary-card home-summary-card--pending">
                <div className="home-summary-card__icon" aria-hidden="true">
                  ◷
                </div>
                <div>
                  <p className="home-summary-card__label">Pending</p>
                  <p className="home-summary-card__value">
                    {loading ? "—" : summary.pending}
                  </p>
                </div>
              </article>

              <article className="home-summary-card home-summary-card--completed">
                <div className="home-summary-card__icon" aria-hidden="true">
                  ✓
                </div>
                <div>
                  <p className="home-summary-card__label">Completed</p>
                  <p className="home-summary-card__value">
                    {loading ? "—" : summary.completed}
                  </p>
                </div>
              </article>

              <article className="home-summary-card home-summary-card--overdue">
                <div className="home-summary-card__icon" aria-hidden="true">
                  !
                </div>
                <div>
                  <p className="home-summary-card__label">Overdue</p>
                  <p className="home-summary-card__value">
                    {loading ? "—" : summary.overdue}
                  </p>
                </div>
              </article>
            </section>

            <section className="home-task-section">
              <div className="home-task-section__heading">
                <div>
                  <h2 className="home-section-title">Your task list</h2>
                  <p className="home-section-description">
                    {loading
                      ? "Preparing your tasks..."
                      : `${filteredTasks.length} of ${tasks.length} tasks shown`}
                  </p>
                </div>

                {hasActiveFilters && (
                  <button
                    className="home-text-button"
                    type="button"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* TaskFilters is rendered here by the parent page. */}
              <div className="home-filters">
                <TaskFiltersIntegration
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  statusFilter={statusFilter}
                  onStatusChange={setStatusFilter}
                  priorityFilter={priorityFilter}
                  onPriorityChange={setPriorityFilter}
                  categoryFilter={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onReset={resetFilters}
                />
              </div>

              <TaskList
                tasks={filteredTasks}
                isLoading={loading}
                onToggleComplete={handleToggleComplete}
                onEdit={openEditForm}
                onDelete={openDeleteConfirmation}
                emptyTitle={emptyTitle}
                emptyMessage={emptyMessage}
              />
            </section>
          </main>

          <Footer />
        </div>
      </div>

      <Modal
        isOpen={isTaskFormOpen}
        onClose={closeTaskForm}
        title={isEditMode ? "Edit Task" : "Create a Task"}
        size="large"
        closeOnBackdropClick={!isSubmitting}
        closeOnEscape={!isSubmitting}
      >
        <TaskForm
          initialTask={selectedTask}
          onSubmit={handleTaskSubmit}
          onCancel={closeTaskForm}
          isSubmitting={isSubmitting}
          submitLabel={isEditMode ? "Save Changes" : "Create Task"}
        />
      </Modal>

      <Modal
        isOpen={Boolean(taskToDelete)}
        onClose={closeDeleteConfirmation}
        title="Delete Task"
        size="small"
        closeOnBackdropClick={!isDeleting}
        closeOnEscape={!isDeleting}
      >
        <div className="home-delete-confirmation">
          <p>
            Are you sure you want to delete{" "}
            <strong>{taskToDelete?.title || "this task"}</strong>?
          </p>

          <p className="home-delete-confirmation__warning">
            This action cannot be undone.
          </p>

          <div className="home-modal-actions">
            <button
              className="home-button home-button--secondary"
              type="button"
              onClick={closeDeleteConfirmation}
              disabled={isDeleting}
            >
              Cancel
            </button>

            <button
              className="home-button home-button--danger"
              type="button"
              onClick={confirmDeleteTask}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Task"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Import the existing TaskFilters component through a small adapter.
import TaskFilters from "../components/tasks/TaskFilters";

function TaskFiltersIntegration(props) {
  return <TaskFilters {...props} />;
}

export default Home;
