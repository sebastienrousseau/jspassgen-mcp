<!-- SPDX-License-Identifier: Apache-2.0 OR MIT -->

<p align="center">
  <img src="https://raw.githubusercontent.com/sebastienrousseau/jspassgen/main/.github/assets/logo.svg" alt="jspassgen logo" width="128" />
</p>

<h1 align="center">jspassgen-mcp</h1>

<p align="center">
  A local stdio Model Context Protocol server that lets AI assistants generate passwords with jspassgen, on your machine, from the operating system's CSPRNG, with nothing logged.
</p>

<p align="center">
  <a href="https://github.com/sebastienrousseau/jspassgen-mcp/actions"><img src="https://img.shields.io/github/actions/workflow/status/sebastienrousseau/jspassgen-mcp/ci.yml?style=for-the-badge&logo=github" alt="Build" height="28" /></a>
  <a href="https://www.npmjs.com/package/@sebastienrousseau/jspassgen-mcp"><img src="https://img.shields.io/npm/v/@sebastienrousseau/jspassgen-mcp?style=for-the-badge&color=fc8d62&logo=npm" alt="npm (not published yet)" height="28" /></a>
  <a href="https://github.com/sebastienrousseau/jspassgen-mcp#documentation"><img src="https://img.shields.io/badge/docs-readme-blue?style=for-the-badge&labelColor=555555&logo=readthedocs" alt="Docs" height="28" /></a>
  <a href="https://scorecard.dev/viewer/?uri=github.com/sebastienrousseau/jspassgen-mcp"><img src="https://img.shields.io/ossf-scorecard/github.com/sebastienrousseau/jspassgen-mcp?style=for-the-badge&label=OpenSSF%20Scorecard&logo=openssf" alt="OpenSSF Scorecard" height="28" /></a>
  <a href="LICENSE-APACHE"><img src="https://img.shields.io/badge/license-Apache--2.0%20OR%20MIT-blue.svg?style=for-the-badge" alt="License: Apache-2.0 OR MIT" height="28" /></a>
  <a href="https://github.com/sebastienrousseau/jspassgen-mcp#requirements"><img src="https://img.shields.io/badge/Node.js-22%2B-93450a.svg?style=for-the-badge&logo=node.js" alt="Node.js 22 or newer" height="28" /></a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/sebastienrousseau/jspassgen-mcp/main/.github/demo.gif" alt="The example client starts jspassgen-mcp over stdio, lists its one tool, generate_password, gets a 24-character password with its entropy, then has a 2000-character request refused because the limit is 1024" width="100%" />
</p>

---

## Contents

**Getting started**

- [Install](#install): from a clone today; npm after the first suite release
- [Requirements](#requirements): Node.js floor, platforms
- [Quick Start](#quick-start): register the server with an MCP client

**The jspassgen ecosystem**

- [The jspassgen ecosystem](#the-jspassgen-ecosystem): the core, its tools, SDKs and site

**Library reference**

- [Capabilities at a glance](#capabilities-at-a-glance): what the server exposes today
- [Ecosystem comparison](#ecosystem-comparison): not published yet
- [Benchmarks](#benchmarks): not measured yet
- [Features](#features): the tool and its guarantees
- [Configuration](#configuration): none yet
- [Examples](#examples): runnable example index

**Operational**

- [When not to use jspassgen](#when-not-to-use-jspassgen): limitations
- [Development](#development): make targets, CI
- [Security](#security): guarantees and reporting
- [Documentation](#documentation): all reference docs
- [Stability guarantees](#stability-guarantees): version axis, output stability, toolchain discipline
- [License](#license)

---

## Install

### As a JavaScript library

```sh
git clone https://github.com/sebastienrousseau/jspassgen-mcp.git
cd jspassgen-mcp
npm ci
```

jspassgen-mcp is a planned member of the jspassgen suite and is **not on
npm yet**: `package.json` is marked `private` until the first suite
release, planned as 0.0.22. Until then, run it from a clone as above.
Once published, it will install with
`npm install @sebastienrousseau/jspassgen-mcp`.

---

## Requirements

- **Node.js 22 or newer** (`engines` in `package.json`; CI tests 22 and
  24).
- Any platform Node.js supports. Randomness comes from Node.js `crypto`
  through jspassgen's `NodeCryptoRandom` adapter.
- An MCP client that can start a local server over stdio.
- No network access at run time.

---

## Quick Start

```json
{
  "mcpServers": {
    "jspassgen": {
      "command": "node",
      "args": ["/absolute/path/to/jspassgen-mcp/bin/jspassgen-mcp.js"]
    }
  }
}
```

Add this entry to your MCP client's server configuration, with the path
of your clone. The client starts the server as a child process and talks
to it over stdin and stdout; ask it for a password and it calls
`generate_password`. To try it without a client:
`node examples/generate-password.mjs 24`.

---

## The jspassgen ecosystem

jspassgen is one suite of repositories that release the same version
([ADR 0001](https://github.com/sebastienrousseau/jspassgen/blob/main/docs/adr/0001-ecosystem-lockstep.md),
inventory in
[`docs/ecosystem.json`](https://github.com/sebastienrousseau/jspassgen/blob/main/docs/ecosystem.json)).
Only the core is released today; every other member, this one included,
is planned.

| Component | Purpose | Use case |
| :--- | :--- | :--- |
| [jspassgen](https://github.com/sebastienrousseau/jspassgen) | The zero-dependency core, Node.js library, web UI and workers (released) | Generate passwords in JavaScript |
| jspassgen-cli | Command-line generator on the core (planned) | Generate passwords in a terminal |
| **jspassgen-mcp** | This server: the core as MCP tools over stdio (planned) | Let an AI assistant generate a password locally |
| jspassgen-lsp | Language server flagging weak literal secrets (planned) | Catch weak secrets in configuration files |
| jspassgen-sdk-python, -rust, -java, -dotnet, -cpp | Native ports of the core, proven by a conformance kit (planned) | The same rules outside JavaScript |
| jspassgen.github.io | jspassgen.com (planned as a suite member) | Product site |

---

## Capabilities at a glance

| Area | Capability | Status |
| :--- | :--- | :--- |
| Tools | `generate_password`: a base64-alphabet password of 1 to 1024 characters | Available |
| Tools | Passphrase generation | Not available yet |
| Tools | Entropy estimate for a configuration | Not available yet (the entropy of a generated password is returned) |
| Tools | Strength analysis of an existing password | Not available yet |
| Transport | stdio, local | Available |
| Transport | HTTP or any remote transport | Not planned |

---

## Ecosystem comparison

No comparison is published yet. A comparison with other MCP password
tools will be added only with evidence behind each claim.

---

## Benchmarks

Not measured yet. Generation time is jspassgen's; this server adds one
MCP round trip over stdio.

---

## Features

- **One tool, `generate_password`.** Input: `length`, an integer from 1
  to 1024, optional (jspassgen's default of 16 applies when it is
  omitted). The bounds are read from jspassgen's
  `PASSWORD_TYPE_METADATA`, so they cannot drift from the core, and are
  advertised in the tool's JSON Schema. Output: the password as text, and
  structured content with `password`, `length`, `entropyBits` and
  `securityLevel` as jspassgen computes them.
- **No generation logic of its own.** Every password comes from
  `@sebastienrousseau/jspassgen` 0.0.20 (pinned exactly), type `strong`,
  drawn from Node.js `crypto`.
- **Invalid input is refused**, not corrected: a non-integer, zero,
  negative or over-limit length returns a tool error naming `length`.
- **Tool annotations** tell clients the tool is read-only,
  non-destructive and closed-world.

---

## Configuration

There is nothing to configure yet: no environment variables, flags or
files. The server reads nothing and writes nothing outside the MCP
messages on stdin and stdout.

---

## Examples

| Example | What it shows | Run |
| :--- | :--- | :--- |
| [`examples/generate-password.mjs`](examples/generate-password.mjs) | An MCP client that starts the server over stdio, lists its tools and calls `generate_password` | `node examples/generate-password.mjs [length]` |

CI runs the example on every push.

---

## When not to use jspassgen

- **You need a password manager.** The server generates; it does not
  store, sync or fill anything.
- **You need a remote or shared server.** It speaks stdio only, to the
  one client that started it. There is no HTTP transport.
- **You need passphrases, entropy estimates for a configuration or
  strength analysis today.** The ADR plans those tools; only
  `generate_password` exists so far.
- **You need it from npm today.** It is not published until the first
  suite release.
- **You do not want the password in the AI conversation.** The password
  is returned to the MCP client, which shows it to the model and may keep
  it in the conversation history. That is inherent to calling a tool;
  generate locally with jspassgen instead.

---

## Development

```bash
mise install     # Node.js 24 (mise.toml)
make install     # npm ci
make check       # ESLint, Prettier, Halstead, tests at 100% coverage, the example, the README check
make audit       # npm audit
```

[DEVELOPMENT.md](DEVELOPMENT.md) lists every CI gate and its local
command; [CONTRIBUTING.md](CONTRIBUTING.md) the rules for a change.

---

## Security

- **Local only.** stdio transport, no listening socket, no network call,
  no telemetry.
- **Nothing logged.** The process writes the MCP protocol to stdout and
  nothing to stderr; a test fails if anything else appears on either. A
  generated password goes to the calling client only.
- **CSPRNG.** Randomness comes from Node.js `crypto` through jspassgen;
  this server adds none of its own.
- **Supply chain.** Dependencies are locked in `package-lock.json`, the
  runtime ones pinned exactly; npm audit, CodeQL, OpenSSF Scorecard and
  Dependabot run in CI, and every workflow action is pinned by commit SHA.

Report vulnerabilities according to [`SECURITY.md`](SECURITY.md).

---

## Documentation

- User manual: not written yet; this README is the reference until it is.
- API reference: [`src/index.js`](src/index.js) and its JSDoc.
- Developer docs: [DEVELOPMENT.md](DEVELOPMENT.md).
- Ecosystem map: [jspassgen ADR 0001](https://github.com/sebastienrousseau/jspassgen/blob/main/docs/adr/0001-ecosystem-lockstep.md).

---

## Stability guarantees

- **Version axis.** `0.0.x`, moving by exactly `0.0.1` in lockstep with
  the jspassgen suite. Before `1.0` any release may break; breaking
  changes are called out in [CHANGELOG.md](CHANGELOG.md).
- **Output stability.** A change to a tool's name, input schema or output
  fields is a breaking change, even when no JavaScript API moves.
- **Minimum toolchain.** Node.js 22, enforced by `engines` and tested in
  CI. Raising it is a breaking change, made only in a release whose
  CHANGELOG states the new floor and the reason.

---

## License

Dual-licensed under either the [Apache License, Version 2.0](LICENSE-APACHE)
or the [MIT license](LICENSE-MIT), at your option. Unless you state
otherwise, any contribution you submit is dual-licensed the same way,
without additional terms.
