/** Paths that look like repository files, as the worker would find them. */
export function mentionedPaths(texts: string[], exclude: string[]): string[] {
  const pathPattern = /[\w.-]+(?:[/\\][\w.-]+)+\.[\w]+/g;
  const seen = new Set<string>();
  const excludeSet = new Set(exclude.map(normalizePath));
  const results: string[] = [];

  for (const text of texts) {
    const matches = text.matchAll(pathPattern);
    for (const match of matches) {
      let path = match[0];

      path = path.replace(/^[`"'(]+/, "");
      path = path.replace(/[`"'),;:.!?]+$/, "");

      const normalized = normalizePath(path);

      if (excludeSet.has(normalized) || seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      results.push(normalized);

      // Cap at twelve - beyond this the context cost exceeds the trap cost
      if (results.length >= 12) {
        return results;
      }
    }
  }

  return results;
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}
