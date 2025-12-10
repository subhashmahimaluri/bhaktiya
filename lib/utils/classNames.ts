/**
 * Utility function for merging class names conditionally
 * Similar to the popular clsx/classnames pattern
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
