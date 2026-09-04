---
name: lane
description: Open, work and land a branch in its own git worktree on Neon Spore — creating the tree, installing into it, finding the port its servers take, and landing with bun run land. Use when starting a piece of work in a worktree, when asked to "make a branch" or "work in a worktree", or when finishing one and putting it on main.
---

# A lane, end to end

A lane is one branch in one worktree, from the first command to the trunk. It
is the thing every session does, and the four places it goes wrong are all
here.

## 1. Open it

```bash
git worktree add .claude/worktrees/<name> -b claude/<name>
```

**A queue item arrives with its branch already made** — `bun run queue next`
created it, and that branch is what stops a second session being handed the
same item. Check it out, do not make another:

```bash
git worktree add .claude/worktrees/queue-<slug> claude/queue-<slug>
```

Then, **from inside the new tree**, `bun install`. This is not optional and
`node_modules` must not be linked or copied from the main checkout: the
workspace links inside it point at the main tree's `packages/*` by absolute
path, so a test would run against another tree's code and report a result about
it.

`bun install` there does **not** put `@neon-spore/*` in a root `node_modules` —
the links land under each package's own. A throwaway script written at the
repository root therefore cannot `import "@neon-spore/shape-sheet"` and has to
use a relative path. `bun test` and the packages are unaffected; this only bites
the measuring script a lane writes when it is about to prove something with a
number.

## 2. Know which server is yours

A port belongs to a tree (`tools/ports.ts`): the main checkout keeps 4173 for
the preview and 4174 for the director, and every worktree derives its own stable
number from its own path. So:

- **Do not use `.claude/launch.json` in a worktree.** Its entries carry no
  `cwd`, so they start the *main* checkout's server, which then serves main's
  code with nothing erroring. That is a verified result taken off the wrong
  bundle, which is the one failure the whole port arrangement exists to prevent.
- Launch by absolute path inside your own tree, read the port out of the
  server's own first line, and confirm who answered:

```bash
curl -s http://localhost:<port>/__preview
```

The `tree` field in that answer must be your worktree. If it is not, the
measurement is not about the code under test.

## 3. Work

Ordinary rules: `bun run check` before saying done, commit when finished,
staging **by path**. One commit per coherent change.

## 4. Land it

```bash
bun run land
```

From inside the lane's worktree. It rebases onto `main`, runs `bun run check` on
the *rebased* tree, fast-forwards, writes the release note from your commit
subject and first paragraph, deletes the branch and sweeps spent worktrees. Do
not do any of that by hand and do not skip a step that looks done.

It pushes `origin/main` only when that sweep actually cleared a lane away, so
most landings leave the trunk local and say how many commits are waiting.
`bun run push` sends them when they are wanted; `bun run land --push` sends this
one landing regardless.

Two things it will refuse, and both refusals are right: a dirty tree (a lane
lands what it committed), and a branch that does not replay onto `main` (resolve
the conflict on the branch, where it is cheap).

The tree you are standing in is **kept**, moved onto `main`'s tip and detached —
carrying on there is `git switch -c <name>`. Every other merged worktree is
swept once nothing has happened in it for five days.

## 5. And when review finds something afterwards

**A defect found after landing is new work, and new work gets a new branch from
`main`.** Do not check the landed branch out again and do not push a fix onto
it: it is missing every landing since, so its `bun run check` answers a question
nobody asked.

Why each of these is what it is: `docs/git-and-landing.md`.
