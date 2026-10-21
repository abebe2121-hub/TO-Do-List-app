import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <p className="footer__copyright">
          &copy; {currentYear} <span className="footer__brand">TaskFlow</span>.
          All rights reserved.
        </p>

        <nav className="footer__links" aria-label="Footer navigation">
          <a className="footer__link" href="mailto:support@taskflow.example">
            Contact
          </a>

          <span className="footer__separator" aria-hidden="true">
            |
          </span>

          <span className="footer__coming-soon">Privacy Policy</span>

          <span className="footer__separator" aria-hidden="true">
            |
          </span>

          <span className="footer__coming-soon">Terms of Service</span>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
