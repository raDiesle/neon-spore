#!/usr/bin/env bash
# Claude models are paid for on a separate account. Routing one through the
# worker's OpenRouter key bills the same family of models twice, on the wrong
# ledger, and defeats the reason a cheap worker exists at all.
#
# This is a hook rather than a line in CONVENTIONS.md because it already
# happened: a session escalated a task the configured worker had missed by
# putting `--model openrouter/anthropic/claude-sonnet-4.5` on the command line,
# twenty-five times. A command-line `--model` overrides the config file and
# every provider rule in it, so the only place left to stop it is before the
# command runs.
set -uo pipefail

payload=$(cat)
command=$(printf '%s' "$payload" | tr '\n' ' ' | grep -o '"command"[[:space:]]*:[[:space:]]*"\([^"\]\|\.\)*"' | head -1)

case "$command" in
  *aider*|*delegate*) ;;
  *) exit 0 ;;
esac

case "$command" in
  *anthropic*|*claude-sonnet*|*claude-opus*|*claude-haiku*) ;;
  *) exit 0 ;;
esac

cat >&2 <<'MSG'
Blocked: this would run the worker on an Anthropic model through OpenRouter.

Those are billed on a separate account that the Claude app is configured
against; through the worker's key they are paid for twice. The worker slot is
for open weights only.

If the configured worker has missed twice, the escalation is the commented
model line in .aider.conf.yml, or taking the task back into the session and
saying so. It is never a Claude model on the OpenRouter key.
MSG
exit 2
