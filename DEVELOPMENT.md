<!-- SPDX-License-Identifier: Apache-2.0 OR MIT -->

# Development

## Setup

```sh
mise install          # Node.js 24 (mise.toml); the floor is 22
make install          # npm ci: the locked dependencies
```

`package-lock.json` is committed and CI installs with `npm ci`. `.npmrc`
saves exact versions and enforces `engines`.

## Layout

| Path | What it holds |
| :--- | :--- |
| `bin/jspassgen-mcp.js` | The executable: connects the server to stdio |
| `src/server.js` | `createServer()`: an `McpServer` with every tool registered |
| `src/tools/generate-password.js` | The `generate_password` schema and handler, calling jspassgen's core service |
| `src/index.js` | The public exports |
| `test/` | mocha suites over an in-memory transport (`server.test.js`) and over real stdio (`stdio.test.js`) |
| `examples/` | Runnable MCP clients; CI runs each one |
| `scripts/halstead.mjs` | The Halstead difficulty gate |
| `scripts/readme-check.sh` | The README template check |

## How a call travels

The client starts `bin/jspassgen-mcp.js` and sends JSON-RPC over stdin.
The SDK validates the arguments against the tool's zod schema (bounds
read from jspassgen's `PASSWORD_TYPE_METADATA`) and calls the handler,
which asks jspassgen's core service, built with `NodeCryptoRandom`, for a
`strong` password with its entropy. The result goes back on stdout. The
server imports jspassgen's `core` and `adapters/node` entry points only,
not its CLI, so nothing else runs.

## CI gates and their local commands

| CI job | What it checks | Local command |
| :--- | :--- | :--- |
| `ci.yml` lint | ESLint (cyclomatic, cognitive, lines), Prettier, Halstead, npm audit | `make lint format-check complexity audit` |
| `ci.yml` test (Node.js 22, 24) | mocha at 100% coverage, the example over stdio | `make test examples` |
| `ci.yml` pack | The files npm would publish | `make pack` |
| `codeql.yml` | CodeQL for JavaScript and for the workflows | (GitHub only) |
| `docs-lint.yml` | markdownlint, the README template, codespell, REUSE, links | `scripts/readme-check.sh` and the tools named in the workflow |
| `dco.yml` | `Signed-off-by:` on every commit | `git log --format=%B` |
| `scorecard.yml` | OpenSSF Scorecard | (GitHub only) |

## Coverage

`npm test` runs mocha under c8 with `all` on and fails below 100% of
statements, branches, functions and lines in `src/` and `bin/`. c8
follows the server into the child process the stdio test starts, so
`bin/` is measured too. There are no exclusion comments.

## Complexity

ESLint enforces cyclomatic complexity 10, SonarSource cognitive
complexity 15 (`eslint-plugin-sonarjs`), 60 lines per function and 500
per file on every JavaScript file, tests and scripts included.
`scripts/halstead.mjs` measures Halstead difficulty per function from
espree's tokens and fails above 30. There is no baseline file because
there is no offender: any function over a ceiling fails the gate.

## Release model

`.github/workflows/release.yml` releases a pushed `v<version>` tag. The
first release is the suite's first lockstep version, 0.0.22.

1. On `feat/v<version>`: move the version in `package.json` and its
   restatements, and date the `CHANGELOG.md` heading. Merge the release
   pull request into `main` once CI is green.
2. Tag `main` with a signed annotated tag, check it with
   `git verify-tag v<version>` (`KEYS.asc`), and push it:
   `git tag -s v<version> -m "jspassgen-mcp v<version>"`.
3. The `check` job refuses a tag that is not annotated, not signed, not
   on the checked-out commit, or whose message or version does not match
   `package.json`. It runs `make check` and `make audit`, packs the
   tarball with `npm pack`, and writes `SHA256SUMS`. CI cannot verify the
   signature itself; step 2 does.
4. The `publish-npm` job waits for a maintainer to approve the `npm`
   environment, then publishes that tarball to npmjs with provenance
   through npm trusted publishing; no npm token is stored. A version
   already on npmjs is skipped.
5. The `github-release` job drafts the GitHub release
   `jspassgen-mcp <version>` with the tarball and `SHA256SUMS`. The maintainer
   writes the Highlights and publishes the draft.

Trusted publishing is configured on npmjs per package: the trusted
publisher names this repository, `release.yml` and the `npm`
environment.
