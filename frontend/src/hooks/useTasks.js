import { useState, useEffect, useMemo, useCallback } from "react";
import { validateTask } from "../services/validators";

const STORAGE_KEY = "todo_tasks";

const DEFAULT_FILTERS = {
  searchTerm: "",
  statusFilter: "all",
  priorityFilter: "all",
  categoryFilter: "all",
  sortBy: "newest",
};

const VALID_STATUSES = ["pending", "completed"];
const VALID_PRIORITIES = ["low", "medium", "high"];
const VALID_CATEGORIES = ["personal", "work", "study", "other"];

const VALID_SORT_OPTIONS = [
  "newest",
  "oldest",
  "dueDateAsc",
  "dueDateDesc",
  "priorityDesc",
  "priorityAsc",
];

const PRIORITY_ORDER = {
  low: 1,
  medium: 2,
  high: 3,
};

// Generate a unique task ID.
function generateTaskId() {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID().
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStatus(value, fallback = "pending") {
  return VALID_STATUSES.includes(value) ? value : fallback;
}

function normalizePriority(value, fallback = "medium") {
  return VALID_PRIORITIES.includes(value) ? value : fallback;
}

function normalizeCategory(value, fallback = "personal") {
  return VALID_CATEGORIES.includes(value) ? value : fallback;
}

// Keep stored data safe and consistent when loading it.
function normalizeStoredTask(task) {
  if (!task || typeof task !== "object" || Array.isArray(task)) {
    return null;
  }

  if (
    task.id === undefined ||
    task.id === null ||
    String(task.id).trim() === ""
  ) {
    return null;
  }

  const title = normalizeText(task.title);

  if (!title) {
    return null;
  }

  const timestamp = getCurrentTimestamp();

  return {
    id: String(task.id),
    title,
    description: normalizeText(task.description),
    dueDate: typeof task.dueDate === "string" ? task.dueDate.trim() : "",
    priority: normalizePriority(task.priority),
    category: normalizeCategory(task.category),
    status: normalizeStatus(task.status),
    createdAt:
      typeof task.createdAt === "string" && task.createdAt
        ? task.createdAt
        : timestamp,
    updatedAt:
      typeof task.updatedAt === "string" && task.updatedAt
        ? task.updatedAt
        : timestamp,
  };
}

function loadTasksFromStorage() {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return { tasks: [], error: null };
    }

    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (storedValue === null) {
      return { tasks: [], error: null };
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return {
        tasks: [],
        error: "Saved tasks data is invalid. Start with an empty task list.",
      };
    }

    const tasks = parsedValue.map(normalizeStoredTask).filter(Boolean);

    return { tasks, error: null };
  } catch {
    return {
      tasks: [],
      error: "Could not load saved tasks from browser storage.",
    };
  }
}

function isValidDate(value) {
  return (
    typeof value === "string" &&
    value.trim() !== "" &&
    !Number.isNaN(Date.parse(value))
  );
}

function compareCreatedAt(a, b) {
  const dateA = Date.parse(a.createdAt) || 0;
  const dateB = Date.parse(b.createdAt) || 0;

  return dateA - dateB;
}

function compareDueDates(a, b, direction) {
  const aHasDate = isValidDate(a.dueDate);
  const bHasDate = isValidDate(b.dueDate);

  // Tasks with no due date always appear last.
  if (!aHasDate && !bHasDate) return 0;
  if (!aHasDate) return 1;
  if (!bHasDate) return -1;

  const difference = Date.parse(a.dueDate) - Date.parse(b.dueDate);

  return direction === "asc" ? difference : -difference;
}

function sortTasks(taskList, sortBy) {
  // Sort a copy, never the original task array.
  const result = [...taskList];

  switch (sortBy) {
    case "oldest":
      return result.sort(compareCreatedAt);

    case "dueDateAsc":
      return result.sort((a, b) => compareDueDates(a, b, "asc"));

    case "dueDateDesc":
      return result.sort((a, b) => compareDueDates(a, b, "desc"));

    case "priorityDesc":
      return result.sort(
        (a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority],
      );

    case "priorityAsc":
      return result.sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
      );

    case "newest":
    default:
      return result.sort((a, b) => compareCreatedAt(b, a));
  }
}

function useTasks() {
  const [tasks, setTasks] = useState(() => {
    const result = loadTasksFromStorage();
    return result.tasks;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(() => {
    const result = loadTasksFromStorage();
    return result.error;
  });

  const [searchTerm, setSearchTermState] = useState(DEFAULT_FILTERS.searchTerm);
  const [statusFilter, setStatusFilterState] = useState(
    DEFAULT_FILTERS.statusFilter,
  );
  const [priorityFilter, setPriorityFilterState] = useState(
    DEFAULT_FILTERS.priorityFilter,
  );
  const [categoryFilter, setCategoryFilterState] = useState(
    DEFAULT_FILTERS.categoryFilter,
  );
  const [sortBy, setSortByState] = useState(DEFAULT_FILTERS.sortBy);

  // Initial loading is synchronous with localStorage initialization.
  // This effect marks initialization complete after mounting.
  useEffect(() => {
    setLoading(false);
  }, []);

  // Persist tasks only after initial loading has completed.
  useEffect(() => {
    if (loading) return;

    try {
      if (typeof window === "undefined" || !window.localStorage) {
        setError("Browser storage is unavailable. Tasks may not persist.");
        return;
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

      // Clear only storage-related errors after a successful save.
      setError((currentError) =>
        currentError === "Could not save tasks to browser storage."
          ? null
          : currentError,
      );
    } catch {
      setError("Could not save tasks to browser storage.");
    }
  }, [tasks, loading]);

  const addTask = useCallback((taskData) => {
    if (!taskData || typeof taskData !== "object") {
      return { success: false, task: null, error: "Invalid task data." };
    }

    const title = normalizeText(taskData.title);

    if (!title) {
      return {
        success: false,
        task: null,
        error: "Task title is required.",
      };
    }

    const now = getCurrentTimestamp();

    const newTask = {
      id: generateTaskId(),
      title,
      description: normalizeText(taskData.description),
      dueDate:
        typeof taskData.dueDate === "string" ? taskData.dueDate.trim() : "",
      priority: normalizePriority(taskData.priority),
      category: normalizeCategory(taskData.category),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
    setError(null);

    return { success: true, task: newTask, error: null };
  }, []);

  const updateTask = useCallback((taskId, updatedData) => {
    if (!updatedData || typeof updatedData !== "object") {
      return {
        success: false,
        task: null,
        error: "Invalid task update data.",
      };
    }

    let updatedTask = null;
    let validationError = null;

    setTasks((currentTasks) => {
      const existingTask = currentTasks.find((task) => task.id === taskId);

      if (!existingTask) {
        validationError = "Task not found.";
        return currentTasks;
      }

      const title =
        updatedData.title === undefined
          ? existingTask.title
          : normalizeText(updatedData.title);

      if (!title) {
        validationError = "Task title is required.";
        return currentTasks;
      }

      updatedTask = {
        ...existingTask,
        title,
        description:
          updatedData.description === undefined
            ? existingTask.description
            : normalizeText(updatedData.description),
        dueDate:
          updatedData.dueDate === undefined
            ? existingTask.dueDate
            : typeof updatedData.dueDate === "string"
              ? updatedData.dueDate.trim()
              : "",
        priority:
          updatedData.priority === undefined
            ? existingTask.priority
            : normalizePriority(updatedData.priority, existingTask.priority),
        category:
          updatedData.category === undefined
            ? existingTask.category
            : normalizeCategory(updatedData.category, existingTask.category),
        status:
          updatedData.status === undefined
            ? existingTask.status
            : normalizeStatus(updatedData.status, existingTask.status),
        id: existingTask.id,
        createdAt: existingTask.createdAt,
        updatedAt: getCurrentTimestamp(),
      };

      return currentTasks.map((task) =>
        task.id === taskId ? updatedTask : task,
      );
    });

    if (validationError) {
      return { success: false, task: null, error: validationError };
    }

    setError(null);

    return { success: true, task: updatedTask, error: null };
  }, []);

  const deleteTask = useCallback((taskId) => {
    let found = false;

    setTasks((currentTasks) => {
      found = currentTasks.some((task) => task.id === taskId);

      if (!found) return currentTasks;

      return currentTasks.filter((task) => task.id !== taskId);
    });

    if (!found) {
      return { success: false, error: "Task not found." };
    }

    setError(null);
    return { success: true, error: null };
  }, []);

  const toggleTaskComplete = useCallback((taskId) => {
    let found = false;

    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) return task;

        found = true;

        return {
          ...task,
          status: task.status === "completed" ? "pending" : "completed",
          updatedAt: getCurrentTimestamp(),
        };
      }),
    );

    if (!found) {
      return { success: false, error: "Task not found." };
    }

    setError(null);
    return { success: true, error: null };
  }, []);

  const getTaskById = useCallback(
    (taskId) => tasks.find((task) => task.id === taskId) ?? null,
    [tasks],
  );

  // Controlled filter handlers.
  const setSearchTerm = useCallback((value) => {
    setSearchTermState(typeof value === "string" ? value : "");
  }, []);

  const setStatusFilter = useCallback((value) => {
    setStatusFilterState(
      value === "all" || VALID_STATUSES.includes(value) ? value : "all",
    );
  }, []);

  const setPriorityFilter = useCallback((value) => {
    setPriorityFilterState(
      value === "all" || VALID_PRIORITIES.includes(value) ? value : "all",
    );
  }, []);

  const setCategoryFilter = useCallback((value) => {
    setCategoryFilterState(
      value === "all" || VALID_CATEGORIES.includes(value) ? value : "all",
    );
  }, []);

  const setSortBy = useCallback((value) => {
    setSortByState(VALID_SORT_OPTIONS.includes(value) ? value : "newest");
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTermState(DEFAULT_FILTERS.searchTerm);
    setStatusFilterState(DEFAULT_FILTERS.statusFilter);
    setPriorityFilterState(DEFAULT_FILTERS.priorityFilter);
    setCategoryFilterState(DEFAULT_FILTERS.categoryFilter);
    setSortByState(DEFAULT_FILTERS.sortBy);
  }, []);

  // Derive the visible tasks from the current tasks and filter values.
  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const matchingTasks = tasks.filter((task) => {
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.description.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "all" || task.category === categoryFilter;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesCategory
      );
    });

    return sortTasks(matchingTasks, sortBy);
  }, [tasks, searchTerm, statusFilter, priorityFilter, categoryFilter, sortBy]);

  return {
    tasks,
    filteredTasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    getTaskById,
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
  };
}

export default useTasks;
