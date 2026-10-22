import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService.js";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm() {
    const newErrors = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      newErrors.fullName = "Full name is required.";
    } else if (trimmedName.length < 2 || trimmedName.length > 100) {
      newErrors.fullName = "Full name must be between 2 and 100 characters.";
    }

    if (!trimmedEmail) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    } else if (new TextEncoder().encode(password).length > 72) {
      newErrors.password = "Password must not exceed 72 UTF-8 bytes.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = "Please accept the terms to continue.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    setServerError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await registerUser({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.success !== true) {
        setServerError(
          result?.message ||
            "We could not create your account. Please try again.",
        );
        return;
      }

      setSuccessMessage(
        result.message || "Your account was created successfully.",
      );

      navigate("/login", {
        state: { registrationSuccess: true },
      });
    } catch (error) {
      setServerError(
        error?.response?.data?.message ||
          error?.message ||
          "A connection error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearFieldError(fieldName) {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: "",
    }));
    setServerError("");
    setSuccessMessage("");
  }

  return (
    <main className="register-page">
      <section className="register-shell" aria-label="Create an account">
        <aside className="register-showcase">
          <Link to="/" className="register-brand">
            <span className="register-brand-icon" aria-hidden="true">
              ✓
            </span>
            <span>TaskFlow</span>
          </Link>

          <div className="register-showcase-content">
            <span className="register-eyebrow">
              YOUR NEXT CHAPTER STARTS HERE
            </span>

            <h2>Make room for what matters.</h2>

            <p>
              Build better habits, organize your priorities, and turn everyday
              plans into meaningful progress.
            </p>

            <div className="register-feature">
              <span aria-hidden="true">✓</span>
              <span>Organize your personal and work tasks</span>
            </div>

            <div className="register-feature">
              <span aria-hidden="true">✓</span>
              <span>Stay focused on your goals</span>
            </div>

            <div className="register-feature">
              <span aria-hidden="true">✓</span>
              <span>Celebrate your progress</span>
            </div>
          </div>

          <p className="register-showcase-footer">
            Start small. Stay consistent. Keep moving forward.
          </p>
        </aside>

        <div className="register-form-panel">
          <div className="register-form-header">
            <span className="register-mobile-brand">
              <span className="register-brand-icon" aria-hidden="true">
                ✓
              </span>
              TaskFlow
            </span>

            <h1>Create Your Account</h1>
            <p>Join TaskFlow and start organizing your day.</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div className="register-alert" role="alert">
                {serverError}
              </div>
            )}

            {successMessage && (
              <div className="register-success" role="status">
                {successMessage}
              </div>
            )}

            <div className="register-field">
              <label htmlFor="register-full-name">Full name</label>
              <input
                id="register-full-name"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  clearFieldError("fullName");
                }}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={
                  errors.fullName ? "register-name-error" : undefined
                }
              />

              {errors.fullName && (
                <p className="register-field-error" id="register-name-error">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="register-field">
              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearFieldError("email");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "register-email-error" : undefined
                }
              />

              {errors.email && (
                <p className="register-field-error" id="register-email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="register-field">
              <label htmlFor="register-password">Password</label>

              <div className="register-password-wrapper">
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearFieldError("password");

                    if (confirmPassword) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        confirmPassword: "",
                      }));
                    }
                  }}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby="register-password-hint"
                />

                <button
                  className="register-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  disabled={isSubmitting}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="register-field-hint" id="register-password-hint">
                Use at least 8 characters. Do not reuse a password from another
                account.
              </p>

              {errors.password && (
                <p
                  className="register-field-error"
                  id="register-password-error"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div className="register-field">
              <label htmlFor="register-confirm-password">
                Confirm password
              </label>

              <div className="register-password-wrapper">
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    clearFieldError("confirmPassword");
                  }}
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword
                      ? "register-confirm-password-error"
                      : undefined
                  }
                />

                <button
                  className="register-password-toggle"
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  aria-pressed={showConfirmPassword}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.confirmPassword && (
                <p
                  className="register-field-error"
                  id="register-confirm-password-error"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="register-terms-field">
              <label className="register-terms-label">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={acceptTerms}
                  onChange={(event) => {
                    setAcceptTerms(event.target.checked);
                    clearFieldError("acceptTerms");
                  }}
                  required
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.acceptTerms)}
                  aria-describedby={
                    errors.acceptTerms ? "register-terms-error" : undefined
                  }
                />

                <span>
                  I agree to the Terms and Conditions and Privacy Policy.
                </span>
              </label>

              {errors.acceptTerms && (
                <p className="register-field-error" id="register-terms-error">
                  {errors.acceptTerms}
                </p>
              )}
            </div>

            <button
              className="register-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="register-spinner" aria-hidden="true" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="register-login-prompt">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <p className="register-security-note">
            Your information must be handled securely by the authentication
            service.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
