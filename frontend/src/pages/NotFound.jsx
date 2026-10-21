import { Link, useNavigate } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  function handleGoBack() {
    // If there is no previous page, return to the home route.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  return (
    <main className="not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <Link to="/" className="not-found-brand" aria-label="TaskFlow home">
          <span className="not-found-brand-icon" aria-hidden="true">
            ✓
          </span>
          <span>TaskFlow</span>
        </Link>

        <div className="not-found-illustration" aria-hidden="true">
          <span className="not-found-orbit not-found-orbit-one" />
          <span className="not-found-orbit not-found-orbit-two" />

          <div className="not-found-paper">
            <span className="not-found-paper-fold" />
            <span className="not-found-paper-line" />
            <span className="not-found-paper-line short" />
            <span className="not-found-paper-line" />
            <span className="not-found-paper-question">?</span>
          </div>

          <span className="not-found-floating-dot dot-one" />
          <span className="not-found-floating-dot dot-two" />
          <span className="not-found-floating-dot dot-three" />
        </div>

        <p className="not-found-code">ERROR 404</p>

        <h1 id="not-found-title">Page Not Found</h1>

        <p className="not-found-message">
          Sorry, the page you're looking for doesn't exist or may have moved.
          Let's get you back on track.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="not-found-home-button">
            <span aria-hidden="true">←</span>
            Back to Home
          </Link>

          <button
            type="button"
            className="not-found-back-button"
            onClick={handleGoBack}
          >
            Go Back
          </button>
        </div>

        <p className="not-found-footer">
          Don't worry — every great plan has a detour.
        </p>
      </section>
    </main>
  );
}

export default NotFound;
