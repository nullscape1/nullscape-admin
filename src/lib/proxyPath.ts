/**
 * Validates [...path] segments for /api/proxy — blocks traversal and control chars.
 */
export function assertSafeProxySubpath(subpath: string): string | null {
  if (!subpath || subpath.length > 2048) return null;
  if (/%2[eE]|\.\.|%2[fF]{2}|\\|\0|\r|\n/.test(subpath)) return null;
  try {
    const decoded = decodeURIComponent(subpath);
    if (decoded.includes('..') || decoded.includes('\\')) return null;
  } catch {
    return null;
  }
  return subpath;
}
