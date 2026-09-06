/**
 * The three things every part of this tool needs before it can do anything:
 * where the checkout is, how to ask git something, and how to run a command in
 * a directory and hear about it if it fails.
 *
 * Their own file so that `scratch.ts` can call git without importing the
 * capture it is a part of — `serve.ts` re-exports all three, so nothing that
 * already imported them from there had to move.
 */

/** The checkout this tool is running out of — where a scratch worktree is
 * cut from, and where `docs/frames/` lives. */
export const root = Bun.fileURLToPath(new URL("../../", import.meta.url));

export async function git(args: string[], cwd = root): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, code, err] = await Promise.all([
    new Response(proc.stdout).text(),
    proc.exited,
    new Response(proc.stderr).text(),
  ]);
  if (code !== 0) throw new Error(`git ${args.join(" ")} failed: ${err.trim() || out.trim()}`);
  return out.trim();
}

export async function run(cmd: string[], cwd: string): Promise<void> {
  const proc = Bun.spawn(cmd, { cwd, stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`${cmd.join(" ")} exited ${code} in ${cwd}`);
}
