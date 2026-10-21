import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTasks } from "../context/TaskContext.jsx";
import "./Dashboard.css";

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: "⌂" },
  { label: "All Tasks", path: "/tasks", icon: "☷" },
  { label: "Today", path: "/tasks/today", icon: "◷" },
  { label: "Upcoming", path: "/tasks/upcoming", icon: "▦" },
  { label: "Completed", path: "/tasks/completed", icon: "✓" },
  { label: "Categories", path: "/categories", icon: "◈" },
  { label: "Projects", path: "/projects", icon: "▣" },
  { label: "Settings", path: "/settings", icon: "⚙" },
];

const defaultForm = {
  title: "",
  description: "",
  category: "General",
  dueDate: "",
};

const standardCategories = [
  "General",
  "Work",
  "Personal",
  "Study",
  "Development",
];

export default function Dashboard() {
  const {
    currentUser,
    tasks = [],
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    logout,
  } = useTasks();

  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("taskflow_theme") || "light",
  );

  const isDashboard = path === "/dashboard";
  const isSettings = path === "/settings";
  const isCategories = path === "/categories";
  const isProjects = path === "/projects";
  const today = getLocalDate();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("taskflow_theme", theme);
  }, [theme]);

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks],
  );

  const pendingTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks],
  );

  const todayTasks = useMemo(
    () => pendingTasks.filter((task) => task.dueDate === today),
    [pendingTasks, today],
  );

  const upcomingTasks = useMemo(
    () => pendingTasks.filter((task) => task.dueDate && task.dueDate > today),
    [pendingTasks, today],
  );

  const overdueTasks = useMemo(
    () => pendingTasks.filter((task) => task.dueDate && task.dueDate < today),
    [pendingTasks, today],
  );

  const allCategories = useMemo(() => {
    const fromTasks = tasks.map((task) => task.category).filter(Boolean);
    return [...new Set([...standardCategories, ...fromTasks])];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (path === "/tasks/today") {
      result = result.filter((task) => task.dueDate === today);
    } else if (path === "/tasks/upcoming") {
      result = result.filter(
        (task) => !task.completed && task.dueDate && task.dueDate > today,
      );
    } else if (path === "/tasks/completed") {
      result = result.filter((task) => task.completed);
    } else if (path === "/categories") {
      result = result.filter((task) => task.category);
    }

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((task) =>
        `${task.title || ""} ${task.description || ""} ${task.category || ""}`
          .toLowerCase()
          .includes(query),
      );
    }

    return result.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks, path, today, search]);

  const pageTitle = useMemo(() => {
    const match = navigation.find((item) => item.path === path);
    return match ? match.label : "Dashboard";
  }, [path]);

  // FIX: Your actual Home page route is "/".
  function goHome() {
    navigate("/");
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(defaultForm);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(task) {
    setEditingId(task.id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      category: task.category || "General",
      dueDate: task.dueDate || "",
    });
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(defaultForm);
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError("Please enter a task title.");
      return;
    }

    const taskData = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category || "General",
      dueDate: form.dueDate,
    };

    try {
      if (editingId !== null) {
        await updateTask(editingId, taskData);
      } else {
        await addTask(taskData);
      }

      closeForm();
    } catch (error) {
      setFormError(
        error?.message || "Unable to save the task. Please try again.",
      );
    }
  }

  async function handleToggleTask(task) {
    try {
      await toggleTask(task.id);
    } catch (error) {
      console.error("Unable to update task:", error);
    }
  }

  async function handleDeleteTask(task) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`,
    );

    if (!confirmed) return;

    try {
      await deleteTask(task.id);
    } catch (error) {
      console.error("Unable to delete task:", error);
    }
  }

  function handleLogout() {
    setShowLogoutConfirm(true);
  }

  async function confirmLogout() {
    setShowLogoutConfirm(false);

    try {
      localStorage.removeItem("taskflow_session");
      localStorage.removeItem("token");
      sessionStorage.clear();

      if (typeof logout === "function") {
        await logout();
      }

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Unable to log out:", error);
      navigate("/login", { replace: true });
    }
  }

  function cancelLogout() {
    setShowLogoutConfirm(false);
  }

  function formatDueDate(dateString) {
    if (!dateString) return "No due date";

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getTaskStatus(task) {
    if (task.completed) return "Completed";
    if (task.dueDate && task.dueDate < today) return "Overdue";
    if (task.dueDate === today) return "Due today";
    return "Pending";
  }

  const displayTasks = isDashboard ? filteredTasks.slice(0, 5) : filteredTasks;

  return (
    <div className={`dashboard-layout ${theme === "dark" ? "dark-mode" : ""}`}>
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="Go to Home page">
          <span className="brand-icon">✓</span>
          <span>TaskFlow</span>
        </Link>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.path === "/tasks" && (
                <span className="nav-count">{pendingTasks.length}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-card">
            <div className="avatar">
              {(currentUser?.name || currentUser?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="profile-info">
              <strong>{currentUser?.name || "User"}</strong>
              <span>{currentUser?.email || "TaskFlow account"}</span>
            </div>
          </div>

          <button type="button" className="sidebar-action" onClick={goHome}>
            <span>←</span> Back Home
          </button>

          <button
            type="button"
            className="sidebar-action logout-button"
            onClick={handleLogout}
          >
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / {pageTitle}</p>
            <h1>{pageTitle}</h1>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="secondary-button home-top-button"
              onClick={goHome}
            >
              ← Home
            </button>

            {!isSettings && (
              <button
                type="button"
                className="primary-button"
                onClick={openCreateForm}
              >
                <span>＋</span> Add Task
              </button>
            )}
          </div>
        </header>

        {isDashboard && (
          <>
            <section className="welcome-panel">
              <div className="welcome-copy">
                <p className="eyebrow">YOUR PRODUCTIVITY SPACE</p>
                <h2>
                  Welcome back, {currentUser?.name?.split(" ")[0] || "there"}!
                </h2>
                <p>
                  Keep your focus, organize your work, and make today count.
                </p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={openCreateForm}
                >
                  ＋ Create a task
                </button>
              </div>

              <div className="welcome-art" aria-hidden="true">
                <div className="art-circle">✓</div>
                <div className="art-card art-card-one">✦ Stay focused</div>
                <div className="art-card art-card-two">✓ Task completed</div>
              </div>
            </section>

            <section className="stats-grid" aria-label="Task statistics">
              <StatCard
                icon="☷"
                label="Total tasks"
                value={tasks.length}
                detail="All your tasks"
                color="blue"
              />
              <StatCard
                icon="◷"
                label="Pending"
                value={pendingTasks.length}
                detail="Still to do"
                color="orange"
              />
              <StatCard
                icon="✓"
                label="Completed"
                value={completedTasks.length}
                detail="Tasks finished"
                color="green"
              />
              <StatCard
                icon="!"
                label="Overdue"
                value={overdueTasks.length}
                detail="Need attention"
                color="red"
              />
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Recent tasks</h2>
                  <p>Your latest tasks and priorities</p>
                </div>
                <Link to="/tasks" className="view-all-link">
                  View all tasks →
                </Link>
              </div>

              <TaskList
                tasks={displayTasks}
                formatDueDate={formatDueDate}
                getTaskStatus={getTaskStatus}
                onToggle={handleToggleTask}
                onEdit={openEditForm}
                onDelete={handleDeleteTask}
              />
            </section>
          </>
        )}

        {!isDashboard && !isSettings && !isCategories && !isProjects && (
          <section className="content-card">
            <div className="section-heading task-page-heading">
              <div>
                <h2>{pageTitle}</h2>
                <p>
                  {path === "/tasks/today"
                    ? `${todayTasks.length} task(s) due today`
                    : path === "/tasks/upcoming"
                      ? `${upcomingTasks.length} upcoming task(s)`
                      : path === "/tasks/completed"
                        ? `${completedTasks.length} completed task(s)`
                        : `${tasks.length} task(s) in your workspace`}
                </p>
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={openCreateForm}
              >
                ＋ Add Task
              </button>
            </div>

            <div className="search-wrap">
              <span>⌕</span>
              <input
                className="search-input"
                type="search"
                placeholder="Search tasks, descriptions, or categories..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <TaskList
              tasks={displayTasks}
              formatDueDate={formatDueDate}
              getTaskStatus={getTaskStatus}
              onToggle={handleToggleTask}
              onEdit={openEditForm}
              onDelete={handleDeleteTask}
            />
          </section>
        )}

        {isCategories && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>Your categories</h2>
                <p>Tasks organized by category</p>
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={openCreateForm}
              >
                ＋ Add Task
              </button>
            </div>

            <div className="category-grid">
              {allCategories.map((category) => {
                const categoryTasks = tasks.filter(
                  (task) => task.category === category,
                );

                return (
                  <div className="category-card" key={category}>
                    <div className="category-symbol">◈</div>
                    <div>
                      <h3>{category}</h3>
                      <p>
                        {categoryTasks.length}{" "}
                        {categoryTasks.length === 1 ? "task" : "tasks"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section-heading category-task-heading">
              <div>
                <h2>All categorized tasks</h2>
                <p>Search through your task categories</p>
              </div>
            </div>

            <div className="search-wrap">
              <span>⌕</span>
              <input
                className="search-input"
                type="search"
                placeholder="Search by task or category..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <TaskList
              tasks={filteredTasks}
              formatDueDate={formatDueDate}
              getTaskStatus={getTaskStatus}
              onToggle={handleToggleTask}
              onEdit={openEditForm}
              onDelete={handleDeleteTask}
            />
          </section>
        )}

        {isProjects && (
          <section className="content-card empty-projects">
            <div className="empty-icon">▣</div>
            <h2>Projects</h2>
            <p>
              Keep related work together. Create tasks and assign categories to
              organize your projects.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={openCreateForm}
            >
              ＋ Create a task
            </button>
          </section>
        )}

        {isSettings && (
          <section className="content-card settings-card">
            <div className="section-heading">
              <div>
                <h2>Settings</h2>
                <p>Customize your TaskFlow experience.</p>
              </div>
            </div>

            <div className="settings-section">
              <h3>Appearance</h3>
              <p>Choose how TaskFlow looks on this device.</p>

              <div className="theme-options">
                <button
                  type="button"
                  className={`theme-option ${theme === "light" ? "selected" : ""}`}
                  onClick={() => setTheme("light")}
                  aria-pressed={theme === "light"}
                >
                  <span className="theme-preview light-preview">☀</span>
                  <span>
                    <strong>Light mode</strong>
                    <small>Bright background and dark text</small>
                  </span>
                  <span className="theme-radio">
                    {theme === "light" ? "●" : "○"}
                  </span>
                </button>

                <button
                  type="button"
                  className={`theme-option ${theme === "dark" ? "selected" : ""}`}
                  onClick={() => setTheme("dark")}
                  aria-pressed={theme === "dark"}
                >
                  <span className="theme-preview dark-preview">☾</span>
                  <span>
                    <strong>Dark mode</strong>
                    <small>Darker background for low-light use</small>
                  </span>
                  <span className="theme-radio">
                    {theme === "dark" ? "●" : "○"}
                  </span>
                </button>
              </div>
            </div>

            <div className="settings-section">
              <h3>Account</h3>
              <p>Information for your current account.</p>

              <div className="account-details">
                <div className="account-detail">
                  <span>Name</span>
                  <strong>{currentUser?.name || "User"}</strong>
                </div>
                <div className="account-detail">
                  <span>Email</span>
                  <strong>{currentUser?.email || "Not available"}</strong>
                </div>
              </div>
            </div>

            <div className="settings-section settings-actions-section">
              <h3>Navigation and account</h3>
              <p>Return to your home page or sign out of TaskFlow.</p>

              <div className="settings-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={goHome}
                >
                  ← Back to Home
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={handleLogout}
                >
                  ↪ Logout
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">
                  {editingId !== null ? "UPDATE YOUR TASK" : "PLAN YOUR WORK"}
                </p>
                <h2 id="task-modal-title">
                  {editingId !== null ? "Edit task" : "Create a task"}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={closeForm}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Task title *</span>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="What do you need to do?"
                  maxLength={120}
                  autoFocus
                  required
                />
              </label>

              <label className="form-field">
                <span>Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Add some details about this task..."
                  rows={4}
                />
              </label>

              <div className="form-two-columns">
                <label className="form-field">
                  <span>Category</span>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                  >
                    {allCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Due date</span>
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleFormChange}
                  />
                </label>
              </div>

              {formError && (
                <p className="error-message" role="alert">
                  {formError}
                </p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  {editingId !== null ? "Save changes" : "Create task"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showLogoutConfirm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cancelLogout();
          }}
        >
          <section
            className="task-modal logout-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-description"
          >
            <div className="logout-confirm-icon">↪</div>
            <h2 id="logout-modal-title">Confirm Logout</h2>
            <p id="logout-modal-description">
              Are you sure you want to log out of your TaskFlow account?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={confirmLogout}
              >
                OK, Logout
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, detail, color }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-content">
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </article>
  );
}

function TaskList({
  tasks,
  formatDueDate,
  getTaskStatus,
  onToggle,
  onEdit,
  onDelete,
}) {
  if (!tasks.length) {
    return (
      <EmptyState
        icon="✓"
        title="Nothing here yet"
        message="Your tasks will appear here when you add them."
      />
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const status = getTaskStatus(task);
        const statusClass = task.completed
          ? "status-complete"
          : status === "Overdue"
            ? "status-overdue"
            : "status-pending";

        return (
          <article className="task-row" key={task.id}>
            <label
              className="task-checkbox"
              aria-label={`Complete ${task.title}`}
            >
              <input
                type="checkbox"
                checked={Boolean(task.completed)}
                onChange={() => onToggle(task)}
              />
              <span className="custom-checkbox" />
            </label>

            <div className="task-details">
              <h3 className={task.completed ? "completed-title" : ""}>
                {task.title}
              </h3>

              {task.description && <p>{task.description}</p>}

              <div className="task-meta">
                <span className="category-pill">
                  {task.category || "General"}
                </span>
                <span className="due-date">
                  <span>◷</span> {formatDueDate(task.dueDate)}
                </span>
              </div>
            </div>

            <span className={`status-pill ${statusClass}`}>{status}</span>

            <div className="task-actions">
              <button
                type="button"
                className="small-action"
                onClick={() => onEdit(task)}
                aria-label={`Edit ${task.title}`}
                title="Edit task"
              >
                ✎
              </button>
              <button
                type="button"
                className="small-action delete-action"
                onClick={() => onDelete(task)}
                aria-label={`Delete ${task.title}`}
                title="Delete task"
              >
                ×
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function EmptyState({ icon, title, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
