import type { MutableRefObject, Ref, RefCallback } from "react";

/**
 * Combines several refs into one callback ref so a component can both forward a
 * ref and keep its own internal ref to the same node. Replaces the hand-written
 * `if (typeof ref === "function") …` block duplicated across components.
 *
 * ```tsx
 * const innerRef = useRef<HTMLInputElement>(null);
 * <input ref={mergeRefs(ref, innerRef)} />
 * ```
 */
export function mergeRefs<T>(
  ...refs: Array<Ref<T> | undefined>
): RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as MutableRefObject<T | null>).current = node;
    }
  };
}
