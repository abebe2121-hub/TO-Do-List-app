import "./TaskFilters.css";

const DEFAULT_CATEGORIES = [
  { label: "Personal", value: "personal" },
  { label: "Work", value: "work" },
  { label: "Study", value: "study" },
  { label: "Other", value: "other" },
];

const STATUS_OPTIONS = [
  { label: "All Tasks", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
];

const PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "all" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Due Date: Earliest First", value: "dueDateAsc" },
  { label: "Due Date: Latest First", value: "dueDateDesc" },
  { label: "Priority: Highest First", value: "priorityDesc" },
  { label: "Priority: Lowest First", value: "priorityAsc" },
];

function TaskFilters({
  searchTerm = "",
  onSearchChange,
  statusFilter = "all",
  onStatusChange,
  priorityFilter = "all",
  onPriorityChange,
  categoryFilter = "all",
  onCategoryChange,
  sortBy = "newest",
  onSortChange,
  categories = DEFAULT_CATEGORIES,
  onReset,
}) {
  // Support category objects and simple string arrays.
  // Example object: { label: 'University', value: 'university' }
  const availableCategories = Array.isArray(categories)
    ? categories
        .map((category) => {
          if (typeof category === "string") {
            const value = category.trim().toLowerCase();

            if (!value) return null;

            return {
              label: category.trim(),
              value,
            };
          }

          if (
            category &&
            typeof category === "object" &&
            typeof category.value === "string" &&
            category.value.trim()
          ) {
            return {
              label:
                typeof category.label === "string" && category.label.trim()
                  ? category.label.trim()
                  : category.value.trim(),
              value: category.value.trim(),
            };
          }

          return null;
        })
        .filter(Boolean)
    : DEFAULT_CATEGORIES;

  // Remove duplicate values without removing the first occurrence.
  const uniqueCategories = availableCategories.filter(
    (category, index, array) =>
      array.findIndex(
        (item) => item.value.toLowerCase() === category.value.toLowerCase(),
      ) === index,
  );

  const handleSearchChange = (event) => {
    onSearchChange?.(event.target.value);
  };

  const handleReset = () => {
    onReset?.();
  };

  return (
    <section className="task-filters" aria-label="Task search and filters">
      <div className="task-filters__search">
        <label htmlFor="task-search" className="task-filters__label">
          Search tasks
        </label>

        <div className="task-filters__search-field">
          <span className="task-filters__search-icon" aria-hidden="true">
            ⌕
          </span>

          <input
            id="task-search"
            className="task-filters__input"
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search your tasks..."
            autoComplete="off"
          />

          {searchTerm && (
            <button
              className="task-filters__clear"
              type="button"
              onClick={() => onSearchChange?.("")}
              aria-label="Clear search"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="task-filters__controls">
        <div className="task-filters__field">
          <label htmlFor="task-status-filter" className="task-filters__label">
            Status
          </label>

          <select
            id="task-status-filter"
            className="task-filters__select"
            value={statusFilter}
            onChange={(event) => onStatusChange?.(event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="task-filters__field">
          <label htmlFor="task-priority-filter" className="task-filters__label">
            Priority
          </label>

          <select
            id="task-priority-filter"
            className="task-filters__select"
            value={priorityFilter}
            onChange={(event) => onPriorityChange?.(event.target.value)}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="task-filters__field">
          <label htmlFor="task-category-filter" className="task-filters__label">
            Category
          </label>

          <select
            id="task-category-filter"
            className="task-filters__select"
            value={categoryFilter}
            onChange={(event) => onCategoryChange?.(event.target.value)}
          >
            <option value="all">All Categories</option>

            {uniqueCategories
              .filter((category) => category.value.toLowerCase() !== "all")
              .map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
          </select>
        </div>

        <div className="task-filters__field task-filters__field--sort">
          <label htmlFor="task-sort" className="task-filters__label">
            Sort by
          </label>

          <select
            id="task-sort"
            className="task-filters__select"
            value={sortBy}
            onChange={(event) => onSortChange?.(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className="task-filters__reset"
          type="button"
          onClick={handleReset}
        >
          <span aria-hidden="true">↺</span>
          Reset Filters
        </button>
      </div>
    </section>
  );
}

export default TaskFilters;
