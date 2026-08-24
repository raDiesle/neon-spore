import { Glob } from "bun";

/**
 * The patterns in an .aiderignore, as a test against a repository path.
 *
 * This is a reading of the file format rather than a reimplementation of
 * gitignore. It is deliberately allowed to be approximate in the direction of
 * warning: a false warning costs a sentence, a missed one costs a round trip.
 */
export function ignoredBy(patterns: string, path: string): boolean {
  const normalized = path.replace(/\\/g, "/");

  for (const line of patterns.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;

    if (trimmed.endsWith("/")) {
      const dirPattern = `${trimmed}**`;
      const glob = new Glob(dirPattern);
      if (glob.match(normalized)) return true;
    } else {
      const glob = new Glob(trimmed);
      if (glob.match(normalized)) return true;
    }
  }

  return false;
}
