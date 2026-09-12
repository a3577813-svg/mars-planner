"use client";

import { useEffect } from "react";

export default function TeacherReadOnlyGuard() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (!["teacher","methodist"].includes(mode || "")) return;
    const teacherMode = mode === "teacher";

    const apply = () => {
      document
        .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
          "input, textarea, select"
        )
        .forEach((el) => {
          if (teacherMode && el.closest(".tutorReviewDock")) return;

          if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
            el.readOnly = true;
          }

          if (
            el instanceof HTMLSelectElement ||
            (el instanceof HTMLInputElement &&
              ["checkbox", "radio", "file", "button", "submit", "range", "color"].includes(el.type))
          ) {
            el.disabled = true;
          }
        });
    };

    apply();

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
