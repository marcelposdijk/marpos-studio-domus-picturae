/** Astro sets BASE_URL to the mount point of this build ("/" in Studio). */
const base = (import.meta.env?.BASE_URL ?? "/").replace(/\/$/, "");

/** Turn a project-root URL into a browser URL, leaving external URLs alone. */
export function sitePath(path: string): string {
  return path.startsWith("/") && !path.startsWith("//") ? base + path : path;
}

/** Strip the deployment directory before interpreting the locale or route. */
export function projectPath(path: string): string {
  if (!base) return path;
  if (path === base) return "/";
  return path.startsWith(base + "/") ? path.slice(base.length) : path;
}
