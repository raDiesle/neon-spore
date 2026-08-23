# Neon Spore — handover to Claude Code

Everything decided in the chat session is already in the repo. Nothing is lost,
and no context has to be repeated to Claude Code.

Steps 1–4 take about five minutes.

---

## 1. Unpack

Unzip somewhere you keep code, for example:

```bash
cd ~/code
unzip ~/Downloads/neon-spore.zip
cd neon-spore
```

The folder already contains a git repository with one commit. Nothing to
initialise.

## 2. Create the repository on GitHub

With the GitHub CLI:

```bash
gh repo create neon-spore --public --source=. --remote=origin --push
```

Without it: create an empty public repository named `neon-spore` on
github.com (no README, no .gitignore — the folder brings its own), then:

```bash
git remote add origin git@github.com:<your-user>/neon-spore.git
git push -u origin main
```

## 3. Check that it runs

```bash
bun install
bun run check     # typecheck, lint, tests — all green
bun run dev       # http://localhost:3000
```

If `bun` is missing: `curl -fsSL https://bun.sh/install | bash`.

The game shows a grid, creatures gliding down one tile per beat, a cannon and a
shield. At a desk: `Q`/`E` cannon, `←`/`→` shield, `Space` triggers the shield,
`1`/`2` fire red and cyan. This is a skeleton, not the prototype — the port is
the first task.

## 4. Open Claude Code and hand over

```bash
cd ~/code/neon-spore
claude
```

Then paste the contents of `BOOTSTRAP-PROMPT.md` (next to this file) as the
first message.

`CLAUDE.md` loads automatically, the two skills in `.claude/skills/` are
available, and the determinism hook is armed.

---

## What is missing on purpose

**The free-flight prototype.** `signal-bloom-prototyp.html` was not in this
session. Copy it into `legacy/` if you still have it — decision 2 keeps it as
the fallback if the raster model turns out to feel like a puzzle rather than a
game.

**The translated specification.** The full German spec sits in
`legacy/spec-de-original.md`. `docs/spec/README.md` holds the plan for splitting
it into thirteen topic files in English. Do that gradually, one part when a task
needs it — it is cheap, mechanical work and a fast model handles it well. Do not
translate sections 12–14 and 18–20: they are already superseded by
`docs/decisions.md`, `docs/architecture.md` and `docs/working-with-claude.md`.

**A licence.** The repository is public but not licensed. `LICENSE` currently
reserves all rights. Decide before anyone contributes.

**A name check.** "Neon Spore" has not been checked against app stores or
trademarks. Worth doing before the name ends up in more places.

## A note on models

Plan with Opus 5, execute with Sonnet 5. The expensive part is the thinking.
`/model` switches inside a session. Keep `CLAUDE.md` short *and* stable — every
edit to it invalidates the prompt cache for every session in the project, and a
cache hit costs a tenth of a fresh read.
