import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import "./Modal.css";

function Modal({
  isOpen = false,
  onClose,
  title = "Dialog",
  children,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  size = "medium",
  className = "",
}) {
  const generatedId = useId();
  const titleId = `modal-title-${generatedId}`;
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement;

    const dialog = dialogRef.current;

    // Focus the first usable control, or the dialog itself.
    const focusableSelector = [
      "button:not([disabled])",
      "a[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const getFocusableElements = () => {
      if (!dialog) return [];

      return Array.from(dialog.querySelectorAll(focusableSelector)).filter(
        (element) => element.getClientRects().length > 0,
      );
    };

    const focusableElements = getFocusableElements();

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      dialog?.focus();
    }

    // Prevent the page behind the modal from scrolling.
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onClose?.();
        return;
      }

      // Keep keyboard focus inside the open dialog.
      if (event.key === "Tab" && dialog) {
        const elements = getFocusableElements();

        if (elements.length === 0) {
          event.preventDefault();
          dialog.focus();
          return;
        }

        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];

        if (
          event.shiftKey &&
          (document.activeElement === firstElement ||
            !dialog.contains(document.activeElement))
        ) {
          event.preventDefault();
          lastElement.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === lastElement ||
            !dialog.contains(document.activeElement))
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;

      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const validSizes = ["small", "medium", "large"];
  const safeSize = validSizes.includes(size) ? size : "medium";

  const modalClasses = ["modal", `modal--${safeSize}`, className]
    .filter(Boolean)
    .join(" ");

  const handleBackdropClick = (event) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return createPortal(
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <section
        ref={dialogRef}
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="modal__header">
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>

          {showCloseButton && (
            <Button
              variant="ghost"
              size="small"
              className="modal__close"
              aria-label="Close dialog"
              onClick={() => onClose?.()}
            >
              ×
            </Button>
          )}
        </header>

        <div className="modal__body">{children}</div>
      </section>
    </div>,
    document.body,
  );
}

export default Modal;
