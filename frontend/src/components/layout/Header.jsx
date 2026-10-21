import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";

function Header({ isAuthenticated = false, user = null, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close the mobile menu when the user presses Escape.
  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const getNavLinkClass = ({ isActive }) =>
    isActive ? "header__link header__link--active" : "header__link";

  const handleLogout = () => {
    closeMenu();

    // The parent component supplies the logout handler.
    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link
          to="/"
          className="header__brand"
          aria-label="TaskFlow home"
          onClick={closeMenu}
        >
          <span className="header__brand-icon" aria-hidden="true">
            ✓
          </span>
          <span className="header__brand-name">TaskFlow</span>
        </Link>

        <button
          type="button"
          className="header__menu-toggle"
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls="header-navigation"
          onClick={() => setIsMenuOpen((previous) => !previous)}
        >
          <span className="header__menu-line" />
          <span className="header__menu-line" />
          <span className="header__menu-line" />
        </button>

        <nav
          id="header-navigation"
          className={`header__nav ${isMenuOpen ? "header__nav--open" : ""}`}
          aria-label="Main navigation"
        >
          <NavLink to="/" end className={getNavLinkClass} onClick={closeMenu}>
            Home
          </NavLink>

          {!isAuthenticated ? (
            <>
              <NavLink
                to="/login"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `header__register ${
                    isActive ? "header__register--active" : ""
                  }`
                }
                onClick={closeMenu}
              >
                Register
              </NavLink>
            </>
          ) : (
            <div className="header__user-actions">
              <span className="header__user-name">
                Hello, {user?.name || "User"}
              </span>

              {typeof onLogout === "function" && (
                <button
                  type="button"
                  className="header__logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
