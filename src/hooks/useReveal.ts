import { useEffect, useRef } from "react";

/**
 * Reveal-on-scroll hook.
 * Adds the `is-visible` class once the element enters the viewport,
 * triggering the CSS transition defined under `.reveal` in index.css.
 */
export const useReveal = <T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            node.classList.add("is-visible");
            observer.unobserve(node);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px", ...options },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return ref;
};
