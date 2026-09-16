import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * `server.ts` binds a port at module scope: importing it claims a port and
 * calls `Bun.serve`. So anything that merely wants one of its readers and
 * imports the whole file gets a listening server as well — which is what
 * happened to `build.ts`. The build wrote `dist/`, printed every line it
 * prints, and then sat there with the event loop held open by a socket until
 * the idle timer fired an hour later. `bun run build` looked finished and
 * hung, which is the worst place for a hang to be.
 *
 * The reader it wanted lived in `src/docs-api.ts` after that, and that file
 * went with the last study page on 16 September 2026 — so what is left is the
 * rule rather than the arrangement: this fails the moment `build.ts`, or
 * anything it imports, reaches for `server.ts` again, which is the only way
 * that hang comes back.
 */

const DIRECTOR = join(dirname(fileURLToPath(import.meta.url)), "..");
const SERVER_IMPORT = /["'][^"']*(server|ports)\.(js|ts)["']/;

describe("nothing but a server imports the server", () => {
  it("build.ts does not import server.ts", async () => {
    const source = await Bun.file(join(DIRECTOR, "build.ts")).text();
    for (const line of source.match(/^\s*import .*$/gm) ?? []) {
      expect(line).not.toMatch(SERVER_IMPORT);
    }
    expect(source).not.toMatch(/import\s*\(\s*["'][^"']*server\.(js|ts)["']/);
  });

  // The same rule one step further out: `build.ts` bakes what the readers it
  // imports answer with, and the day one of those readers sits in a file that
  // binds a port, the build hangs again — through the import it was given
  // rather than the one it wrote.
  it("nothing build.ts imports imports the server either", async () => {
    const source = await Bun.file(join(DIRECTOR, "build.ts")).text();
    const local = [...source.matchAll(/from "(\.[^"]+)"/g)].map((m) => m[1] as string);
    expect(local.length).toBeGreaterThan(0);
    for (const spec of local) {
      const path = join(DIRECTOR, spec.replace(/\.js$/, ".ts"));
      const text = await Bun.file(path).text();
      for (const line of text.match(/^\s*import .*$/gm) ?? []) {
        expect(line, spec).not.toMatch(SERVER_IMPORT);
      }
    }
  });
});
