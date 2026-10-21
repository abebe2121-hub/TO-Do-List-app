import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({
  taskCounts = {},
  categories = ["Personal", "Work", "Study"],
  onNavigate,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationGroups = [
    {
      title: "MAIN MENU",
      items: [
        { label: "Dashboard", path: "/dashboard" },
        { label: "All Tasks", path: "/tasks", count: taskCounts.all },
        { label: "Today", path: "/tasks/today", count: taskCounts.today },
        {
          label: "Upcoming",
          path: "/tasks/upcoming",
          count: taskCounts.upcoming,
        },
        {
          label: "Completed",
          path: "/tasks/completed",
          count: taskCounts.completed,
        },
      ],
    },
    {
      title: "ORGANIZATION",
      items: [
        { label: "Categories", path: "/categories" },
        { label: "Projects", path: "/projects" },
      ],
    },
  ];

  const handleNavigate = (item) => {
    setIsOpen(false);

    if (typeof onNavigate === "function") {
      onNavigate(item);
    }
  };

  return (
    <>
      <button
        type="button"
        className="sidebar__toggle"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-controls="taskflow-sidebar"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? "✕ Close menu" : "☰ Menu"}
      </button>

      {isOpen && (
        <button
          type="button"
          className="sidebar__overlay"
          aria-label="Close sidebar overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        id="taskflow-sidebar"
        className={`sidebar ${isOpen ? "sidebar--open" : ""}`}
        aria-label="Task management sidebar"
      >
        <nav className="sidebar__nav" aria-label="Dashboard navigation">
          {navigationGroups.map((group) => (
            <section className="sidebar__group" key={group.title}>
              <h2 className="sidebar__heading">{group.title}</h2>

              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                  }
                  onClick={() => handleNavigate(item)}
                >
                  <span>{item.label}</span>

                  {item.count !== undefined && (
                    <span className="sidebar__count">{item.count}</span>
                  )}
                </NavLink>
              ))}
            </section>
          ))}

          <section className="sidebar__group">
            <h2 className="sidebar__heading">CATEGORIES</h2>

            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className="sidebar__category"
                onClick={() =>
                  handleNavigate({
                    type: "category",
                    name: category,
                  })
                }
              >
                <span className="sidebar__category-dot" aria-hidden="true" />
                <span>{category}</span>
              </button>
            ))}
          </section>

          <section className="sidebar__group sidebar__bottom">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
              onClick={() =>
                handleNavigate({ label: "Settings", path: "/settings" })
              }
            >
              Settings
            </NavLink>

            <button
              type="button"
              className="sidebar__category"
              onClick={() => handleNavigate({ type: "help" })}
            >
              Help
            </button>
          </section>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
