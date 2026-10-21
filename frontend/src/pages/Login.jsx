import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateLoginForm } from "../services/validators.js";
import "./Login.css";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm() {
    const newErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    setServerError("");

    if (!validateForm()) return;

    if (typeof onLogin !== "function") {
      setServerError(
        "Login is not connected yet. Please configure the authentication service.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // The password is sent unchanged.
      // The authentication handler must verify credentials with the backend.
      const result = await onLogin({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (result?.success !== true) {
        setServerError(
          result?.message || "Unable to sign in. Please check your details.",
        );
        return;
      }

      // Navigate only after the authentication handler confirms success.
      navigate(result.redirectTo || "/");
    } catch (error) {
      setServerError(
        error?.message || "A connection error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
    setErrors((currentErrors) => ({
      ...currentErrors,
      email: "",
    }));
    setServerError("");
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    setErrors((currentErrors) => ({
      ...currentErrors,
      password: "",
    }));
    setServerError("");
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Sign in">
        <aside className="login-showcase">
          <Link to="/" className="login-brand">
            <span className="login-brand-icon" aria-hidden="true">
              ✓
            </span>
            <span>TaskFlow</span>
          </Link>

          <div className="login-showcase-content">
            <span className="login-eyebrow">MAKE EVERY DAY COUNT</span>
            <h2>Less stress. More progress.</h2>
            <p>
              Organize your tasks, focus on what matters, and make steady
              progress toward your goals.
            </p>

            <div className="login-feature">
              <span aria-hidden="true">✓</span>
              <span>Keep your daily tasks organized</span>
            </div>

            <div className="login-feature">
              <span aria-hidden="true">✓</span>
              <span>Track your progress in one place</span>
            </div>
          </div>

          <p className="login-showcase-footer">
            Small steps lead to big achievements.
          </p>
        </aside>

        <div className="login-form-panel">
          <div className="login-form-header">
            <span className="login-mobile-brand">
              <span className="login-brand-icon" aria-hidden="true">
                ✓
              </span>
              TaskFlow
            </span>

            <h1>Welcome Back</h1>
            <p>Sign in to continue managing your tasks.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div className="login-alert" role="alert">
                {serverError}
              </div>
            )}

            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "login-email-error" : undefined
                }
              />
              {errors.email && (
                <p className="login-field-error" id="login-email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>

              <div className="login-password-wrapper">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
                  }
                />

                <button
                  className="login-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  disabled={isSubmitting}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <p className="login-field-error" id="login-password-error">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={isSubmitting}
                />
                <span>Remember me</span>
              </label>

              <span
                className="login-forgot"
                title="Password reset is not implemented yet"
              >
                Forgot password?
              </span>
            </div>

            <button
              className="login-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="login-spinner" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="login-register-prompt">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>

          <p className="login-security-note">
            Your account will be verified securely by the authentication
            service.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
