// src/components/Modal.jsx
import React from "react";
import { X } from "lucide-react";

const cx = (...xs) => xs.filter(Boolean).join(" ");

/**
 * Modal component with backdrop and close functionality
 *
 * Props:
 * - isOpen: boolean - controls modal visibility
 * - onClose: function - called when modal should close
 * - title: string - modal header title
 * - children: React nodes - modal content
 * - maxWidth: string - max width class (default: "max-w-2xl")
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) {
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cx(
          "relative w-full bg-white shadow-xl",
          maxWidth,
          "mx-4 rounded-2xl overflow-hidden"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="modal-title" className="text-xl font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
