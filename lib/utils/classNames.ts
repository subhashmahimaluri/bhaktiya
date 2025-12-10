/**
 * Utility function for merging class names conditionally
 * Similar to the popular clsx/classnames pattern
 */
export function cn(
  ...classes: (string | boolean | undefined | null | string[])[]
): string {
  return classes
    .flat()
    .filter((c): c is string => typeof c === "string" && c.length > 0)
    .join(" ");
}
