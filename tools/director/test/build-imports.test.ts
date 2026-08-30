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
 * The readers live in `src/docs-api.ts` now. This test is the reason they
 * stay there: it fails the moment a non-server file reaches for `server.ts`
 * again, which is the only way that hang comes back.
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

  it("the readers build.ts bakes come from a file that binds nothing", async () => {
    const docs = await Bun.file(join(DIRECTOR, "src", "docs-api.ts")).text();
    for (const line of docs.match(/^\s*import .*$/gm) ?? []) {
      expect(line).not.toMatch(SERVER_IMPORT);
    }
    const { readBorrowedText, readSpecFiles, readTowerDefenceText } = await import(
      "../src/docs-api.js"
    );
    expect((await readBorrowedText()).length).toBeGreaterThan(0);
    expect((await readTowerDefenceText()).length).toBeGreaterThan(0);
    expect((await readSpecFiles()).length).toBeGreaterThan(0);
  });
});
