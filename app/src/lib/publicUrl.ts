/** Prefix public asset paths with Vite `base` (needed for GitHub Pages). */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  const cleaned = path.startsWith('/') ? path.slice(1) : path
  return `${base}${cleaned}`
}
