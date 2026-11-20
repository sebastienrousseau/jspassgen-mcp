<!-- SPDX-License-Identifier: Apache-2.0 OR MIT -->

<p align="center">
  <img src="https://raw.githubusercontent.com/sebastienrousseau/jspassgen/main/.github/assets/logo.svg" alt="jspassgen logo" width="128" />
</p>

<h1 align="center">jspassgen-mcp</h1>

<p align="center">
  A local stdio Model Context Protocol server that lets an AI assistant generate passwords with jspassgen on your machine, from Node.js <code>crypto</code>, with nothing logged.
</p>

<p align="center">
  <a href="https://github.com/sebastienrousseau/jspassgen-mcp/actions"><img src="https://img.shields.io/github/actions/workflow/status/sebastienrousseau/jspassgen-mcp/ci.yml?style=for-the-badge&logo=github" alt="Build" height="28" /></a>
  <a href="https://www.npmjs.com/package/@sebastienrousseau/jspassgen-mcp"><img src="https://img.shields.io/npm/v/@sebastienrousseau/jspassgen-mcp?style=for-the-badge&color=fc8d62&logo=npm" alt="Registry" height="28" /></a>
  <a href="https://github.com/sebastienrousseau/jspassgen-mcp/blob/main/DEVELOPMENT.md"><img src="https://img.shields.io/badge/docs-development-blue?style=for-the-badge&labelColor=555555&logo=readthedocs" alt="Docs" height="28" /></a>
  <a href="https://scorecard.dev/viewer/?uri=github.com/sebastienrousseau/jspassgen-mcp"><img src="https://img.shields.io/ossf-scorecard/github.com/sebastienrousseau/jspassgen-mcp?style=for-the-badge&label=OpenSSF%20Scorecard&logo=openssf" alt="OpenSSF Scorecard" height="28" /></a>
  <a href="LICENSE-APACHE"><img src="https://img.shields.io/badge/license-Apache--2.0%20OR%20MIT-blue.svg?style=for-the-badge" alt="License: Apache-2.0 OR MIT" height="28" /></a>
  <a href="#requirements"><img src="https://img.shields.io/badge/Node.js-22%2B-93450a.svg?style=for-the-badge&logo=node.js" alt="Node.js 22 or newer" height="28" /></a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/sebastienrousseau/jspassgen-mcp/main/.github/demo.gif" alt="The example client starts jspassgen-mcp over stdio, lists its one tool, generate_password, gets a 24-character password with its entropy, then has a 2000-character request refused because the limit is 1024" width="100%" />
</p>

---

## Contents

**Getting started**

- [Install](#install): npm, `npx`, or a checkout
- [Requirements](#requirements): Node.js floor, platforms, MCP client
- [Quick Start](#quick-start): register the server with an MCP client

**The jspassgen ecosystem**

- [The jspassgen ecosystem](#the-jspassgen-ecosystem): the core library, its tools and native SDKs, released in lockstep

**Library reference**

- [Capabilities at a glance](#capabilities-at-a-glance): what the server exposes today, and what it does not yet
- [Ecosystem comparison](#ecosystem-comparison): none published yet, and why
- [Benchmarks](#benchmarks): none yet, and why
- [Features](#features): the `generate_password` tool
- [Configuration](#configuration): nothing to configure yet
- [Examples](#examples): runnable example index

**Operational**

- [When not to use jspassgen-mcp](#when-not-to-use-jspassgen-mcp): limitations
- [Development](#development): make targets and CI
- [Security](#security): transport, logging, randomness and supply chain
- [Documentation](#documentation): all reference docs
- [Stability guarantees](#stability-guarantees): version axis, tool contract, toolchain floor
- [License](#license)

---

## Install

### As a JavaScript library

jspassgen-mcp is an MCP server, not a library for applications. Programs
that need passwords should depend on
[`@sebastienrousseau/jspassgen`](https://www.npmjs.com/package/@sebastienrousseau/jspassgen)
directly.

### As an MCP server

Install the `jspassgen-mcp` command globally, or let your MCP client
start it with `npx` (see the Quick Start):

```bash
npm install -g @sebastienrousseau/jspassgen-mcp
```

Run the server from a checkout:

```bash
git clone https://github.com/sebastienrousseau/jspassgen-mcp.git
cd jspassgen-mcp
npm ci
```

---

## Requirements

- Node.js 22 or newer (`engines` in `package.json`, enforced by `.npmrc`).
- Any platform Node.js supports. Randomness comes from Node.js `crypto`
  through jspassgen's `NodeCryptoRandom` adapter.
- An MCP client that can start a local server over stdio.
- No network access at run time.

| Component | Minimum toolchain | Enforcement |
| :--- | :---: | :--- |
| `jspassgen-mcp` | Node.js 22 | `engines` with `engine-strict`; CI tests Node.js 22 and 24 |

---

## Quick Start

```json
{
  "mcpServers": {
    "jspassgen": {
      "command": "npx",
      "args": ["-y", "@sebastienrousseau/jspassgen-mcp"]
    }
  }
}
```

Add this entry to your MCP client's server configuration. The client
starts the server as a child process and talks to it over stdin and
stdout; ask it for a password and it calls `generate_password`. From a
checkout, set `"command"` to `"node"` and `"args"` to the absolute path
of `bin/jspassgen-mcp.js`. To try the server without a client, run
`node examples/generate-password.mjs 24` in a checkout.

---

## The jspassgen ecosystem

jspassgen is one core library and the tools, SDKs and site around it.
Every member is listed in
[`docs/ecosystem.json`](https://github.com/sebastienrousseau/jspassgen/blob/main/docs/ecosystem.json)
and, from the suite's first lockstep release, every member ships the same
version ([ADR 0001](https://github.com/sebastienrousseau/jspassgen/blob/main/docs/adr/0001-ecosystem-lockstep.md)).
The JavaScript tools depend on the core and add no generation logic of
their own; each SDK is a native port that is checked against the core's
conformance kit as its generators land.

| Component | Purpose | Use case |
| :--- | :--- | :--- |
| [`jspassgen`](https://github.com/sebastienrousseau/jspassgen) | Password and passphrase core, Node.js library, CLI, web UI and workers; source of the conformance kit | Programs that generate secrets |
| [`jspassgen-cli`](https://github.com/sebastienrousseau/jspassgen-cli) | Command-line generator built on the core | Passwords in a terminal or a script |
| **`jspassgen-mcp`** | Local stdio MCP server | AI agents that need a generated secret |
| [`jspassgen-lsp`](https://github.com/sebastienrousseau/jspassgen-lsp) | Language server for weak literal secrets | Editors checking configuration and `.env` files |
| [`jspassgen-sdk-python`](https://github.com/sebastienrousseau/jspassgen-sdk-python) | Native port on the `secrets` module | Python programs |
| [`jspassgen-sdk-rust`](https://github.com/sebastienrousseau/jspassgen-sdk-rust) | Native port on the OS CSPRNG | Rust programs |
| [`jspassgen-sdk-java`](https://github.com/sebastienrousseau/jspassgen-sdk-java) | Native port on `SecureRandom` | JVM programs |
| [`jspassgen-sdk-dotnet`](https://github.com/sebastienrousseau/jspassgen-sdk-dotnet) | Native port on `RandomNumberGenerator` | .NET programs |
| [`jspassgen-sdk-cpp`](https://github.com/sebastienrousseau/jspassgen-sdk-cpp) | Native C++17 port on the OS CSPRNG | C++ programs |
| [`jspassgen.github.io`](https://github.com/sebastienrousseau/jspassgen.github.io) | Source of [jspassgen.com](https://jspassgen.com) | Evaluating the suite |

Every member ships at 0.0.23, the suite's second lockstep release: the
core, CLI, MCP and LSP servers on npm, the Python, Rust, Java and .NET
SDKs on PyPI, crates.io, Maven Central and NuGet, and the C++ SDK and
the site as GitHub releases. The table gives each member's purpose, and
each README's Capabilities at a glance says what works today.

---

## Capabilities at a glance

| Area | Capability | Status |
| :--- | :--- | :--- |
| Tools | `generate_password`: a base64-alphabet password of 1 to 1024 characters | Available |
| Tools | Entropy estimate of the generated password | Available, returned with each password |
| Tools | Passphrase generation | Not available yet |
| Tools | Entropy estimate for a configuration | Not available yet |
| Tools | Strength analysis of an existing password | Not available yet |
| Transport | stdio, local | Available |
| Transport | HTTP or any remote transport | Not planned |

ADR 0001 plans the passphrase, entropy and strength tools; only
`generate_password` exists so far.

---

## Ecosystem comparison

No comparison is published yet. A comparison with other MCP password
servers will be added only with evidence behind each claim. Within the
suite, the difference is the interface: this server returns the same
`strong` passwords as `@sebastienrousseau/jspassgen`, through an MCP tool
call instead of a JavaScript import.

---

## Benchmarks

None are published yet, and the repository has no benchmark command.
Generation time is jspassgen's; this server adds one MCP round trip over
stdio.

---

## Features

- One tool, `generate_password`. Its only input is `length`, an optional
  integer from 1 to 1024; jspassgen's default of 16 applies when it is
  omitted.
- The bounds are read from jspassgen's `PASSWORD_TYPE_METADATA`, so they
  cannot drift from the core, and are advertised in the tool's JSON
  Schema.
- The output is the password as text, and structured content with
  `password`, `length`, `entropyBits` and `securityLevel` as jspassgen
  computes them.
- Every password comes from `@sebastienrousseau/jspassgen` 0.0.23 (pinned
  exactly in `package.json`), type `strong`, drawn from Node.js `crypto`.
  The server has no generation logic of its own.
- Invalid input is refused, not corrected: a non-integer, a string,
  `null`, zero, a negative or an over-limit length returns a tool error
  naming `length`.
- Tool annotations tell clients the tool is read-only, non-destructive
  and closed-world.
- `src/index.js` exports `createServer`, `TOOL_NAME`, `LENGTH_LIMITS`,
  `PASSWORD_TYPE` and `createGeneratePasswordHandler`, so the server can
  be connected to another MCP transport.

---

## Configuration

There is nothing to configure yet: no environment variables, flags or
files. The server reads nothing and writes nothing outside the MCP
messages on stdin and stdout. The `length` argument of each call is the
only option.

---

## Examples

| Example | What it shows | Run |
| :--- | :--- | :--- |
| [`examples/generate-password.mjs`](examples/generate-password.mjs) | An MCP client that starts the server over stdio, lists its tools and calls `generate_password` | `node examples/generate-password.mjs [length]` |

`make examples` runs it, and CI runs it on Node.js 22 and 24.

---

## When not to use jspassgen-mcp

- Use a password manager if you need to store, sync or fill passwords.
  This server only generates them.
- Use another server if you need a remote or shared one. This one speaks
  stdio only, to the one client that started it, and has no HTTP
  transport.
- Wait for a later release if you need passphrases, entropy estimates for
  a configuration or strength analysis today. Only `generate_password`
  exists so far.
- Generate locally with jspassgen if the password must not enter the AI
  conversation. The MCP client shows the result to the model and may keep
  it in the conversation history; that is inherent to calling a tool.

---

## Development

```bash
mise install     # Node.js 24 (mise.toml)
make install     # npm ci
make check       # ESLint, Prettier, Halstead, tests at 100% coverage, the example, the README check
make audit       # npm audit
make pack        # list what npm would publish
make demo        # render .github/demo.gif with vhs
```

CI runs ESLint (cyclomatic 10, cognitive 15, 60 lines per function, 500
per file), Prettier, Halstead difficulty 30, npm audit, the tests at
100% statements, branches, functions and lines on Node.js 22 and 24, the
example over stdio, the npm tarball listing, markdownlint, codespell,
REUSE, link checks, CodeQL, DCO and OpenSSF Scorecard.
[`DEVELOPMENT.md`](DEVELOPMENT.md) maps every CI gate to its local
command; [`CONTRIBUTING.md`](CONTRIBUTING.md) sets the rules for a change.

---

## Security

Report vulnerabilities privately according to [`SECURITY.md`](SECURITY.md).

The server is local only: stdio transport, no listening socket, no
network call and no telemetry. It writes the MCP protocol to stdout and
nothing to stderr, and `test/stdio.test.js` fails if anything else
appears on either. A generated password goes to the calling client only.
Randomness comes from Node.js `crypto` through jspassgen; the server adds
none of its own. Dependencies are locked in `package-lock.json`, with the
runtime ones pinned exactly. npm audit, CodeQL, OpenSSF Scorecard and
Dependabot run on the repository, and every workflow action is pinned by
commit SHA.

---

## Documentation

There is no rendered manual yet; this README and the files below are the
reference.

- [Developer documentation](DEVELOPMENT.md)
- [Contributing guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)
- [Governance](GOVERNANCE.md)
- [API entry point](src/index.js)
- [Ecosystem inventory](https://github.com/sebastienrousseau/jspassgen/blob/main/docs/ecosystem.json)
- [Ecosystem design (jspassgen ADR 0001)](https://github.com/sebastienrousseau/jspassgen/blob/main/docs/adr/0001-ecosystem-lockstep.md)

---

## Stability guarantees

- Versions are `0.0.x` and move by exactly `0.0.1`, in lockstep with the
  jspassgen suite.
- Before `1.0` any release may break; [`CHANGELOG.md`](CHANGELOG.md)
  calls out each breaking change.
- A change to a tool's name, input schema or output fields is a breaking
  change, even when no JavaScript API moves.
- The Node.js floor is 22, enforced by `engines` and tested in CI. Raising
  it is a breaking change, made only in a release whose changelog states
  the new floor and the reason.

---

## License

Licensed under either [Apache License 2.0](LICENSE-APACHE) or
[MIT](LICENSE-MIT), at your option.
