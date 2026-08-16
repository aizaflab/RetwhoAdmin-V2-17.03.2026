import { useCallback, useState } from "react";

/**
 * Unifies the controlled/uncontrolled pattern every stateful control repeats by
 * hand. Pass `value` to control it; omit `value` and pass `defaultValue` to let
 * the hook own the state. `onChange` always fires so controlled parents stay in
 * sync. Returns a `[current, setValue]` tuple like `useState`.
 *
 * ```ts
 * const [checked, setChecked] = useControllableState({
 *   value: props.checked,
 *   defaultValue: props.defaultChecked ?? false,
 *   onChange: props.onCheckedChange,
 * });
 * ```
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: T) => void] {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<T>(defaultValue);
  const current = isControlled ? (value as T) : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [current, setValue];
}
