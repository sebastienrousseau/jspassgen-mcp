<!-- SPDX-License-Identifier: Apache-2.0 OR MIT -->

# AGENTS.md

`jspassgen-mcp` is a local stdio Model Context Protocol server for the
jspassgen suite. It exposes `@sebastienrousseau/jspassgen` to MCP clients
as tools and adds no generation logic of its own. Its value is that an AI
assistant can get a password made on the user's machine, from the
platform CSPRNG, with the same rules as every other suite member, and
that the secret goes only to the local client. The design is jspassgen's
[ADR 0001](https://github.com/sebastienrousseau/jspassgen/blob/main/docs/adr/0001-ecosystem-lockstep.md).
Read [CONTRIBUTING.md](CONTRIBUTING.md) and
[DEVELOPMENT.md](DEVELOPMENT.md) as well, and the workspace standard in
`~/Code/AGENTS.md`.

## Rules

- **Version.** `0.0.x`, moving by exactly `0.0.1`, in lockstep with the
  jspassgen suite; never propose a jump. The first version was 0.0.22, the
  first suite release. The version lives in `package.json` and is
  restated in `package-lock.json`, `CITATION.cff`, `CHANGELOG.md`, and the
  SECURITY and SUPPORT tables; move them together. Work for the next
  version happens on `feat/v<next-version>`; every other branch,
  Dependabot's included, lands on that branch, never on `main`.
- **Publishing is the maintainer's.** `private: true` was removed and
  `release.yml` added for the first suite release, 0.0.22, on the
  maintainer's instruction. Do not change how the package publishes
  without the maintainer.
- **No generation logic.** Every password, entropy figure and limit comes
  from `@sebastienrousseau/jspassgen`, pinned to an exact version. A new
  kind of password, or a change to how one is made, belongs in jspassgen.
- **stdio only, local only.** No HTTP or other remote transport, no
  network call, no telemetry.
- **Never log or expose secrets.** Nothing on stdout but the MCP
  protocol, nothing on stderr; an error message never repeats a generated
  value. `test/stdio.test.js` fails on any stray output.
- **Gates.** `make check` must pass: ESLint (cyclomatic 10, cognitive 15,
  60 lines per function, 500 lines per file), Prettier, Halstead
  difficulty 30 (`scripts/halstead.mjs`, no baseline: there is no
  offender), the tests at 100% statements, branches, functions and lines,
  the example and the README template check. `make audit` must report no
  vulnerability. No blanket suppressions.
- **Commits.** Conventional, signed off (`git commit -s`) by the human
  only, SSH-signed, with an `Assisted-by:` trailer for agent work. Never
  rewrite pushed history; never merge into `main` without the maintainer.

## The gate

```sh
make install   # npm ci
make check     # the local gate
make audit     # npm audit
```

## Leave alone

`LICENSE-*`, `LICENSES/`, `DCO.txt` and `KEYS.asc`, unless the task is to
update them. `.github/demo.gif` is rendered by `make demo`, never edited.
