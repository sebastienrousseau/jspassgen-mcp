<!-- SPDX-License-Identifier: Apache-2.0 OR MIT -->

# Security Policy

## Supported versions

This package follows the
[jspassgen](https://github.com/sebastienrousseau/jspassgen) suite cadence.
The latest release is `0.0.24`, its third. While pre-`1.0`, the latest
released `0.0.x` receives security fixes; older ones do not.

| Version | Status | Receives security fixes? |
| :--- | :--- | :--- |
| `0.0.24` | Latest release | Yes |
| `0.0.23` | Superseded | No |
| `0.0.22` | Superseded | No |
| `main` | In development | Yes |

## Reporting a vulnerability

**Do not open a public issue for security reports.**

Use GitHub Private Vulnerability Reporting:
<https://github.com/sebastienrousseau/jspassgen-mcp/security/advisories/new>.
The maintainer is notified automatically. A vulnerability in how a
password is generated belongs in
[jspassgen's advisories](https://github.com/sebastienrousseau/jspassgen/security/advisories/new).

Please include a description and its impact, a minimal reproducer
(preferably a failing test), the commit or version affected, and any
proposed fix. Never include a password you use.

These are goals, not guarantees: the project is maintained in a personal
capacity, with no SLA. **Acknowledgement**: the goal is within 5 working
days. **Triage**: a severity assessment and remediation plan after
acknowledgement.

## Security posture

### Scope

The server is a local process started by an MCP client. It reads MCP
requests on stdin, generates passwords with jspassgen, and writes MCP
responses on stdout. It has no network transport and makes no network
call.

### Threat model

| Surface | How it is handled |
| :--- | :--- |
| **Secrets in logs** | The server never logs: nothing on stderr, nothing on stdout but the protocol. `test/stdio.test.js` fails on any stray output. |
| **Secrets in errors** | Error messages come from input validation or jspassgen's limits; none repeats a generated value. |
| **Randomness** | jspassgen's `NodeCryptoRandom` (Node.js `crypto`); the server adds no randomness or generation logic. |
| **Input** | `length` is validated as an integer within jspassgen's bounds (1 to 1024) before jspassgen is called, and again by jspassgen. |
| **Remote access** | None: stdio only, to the one client that started the process. |
| **The client side** | A returned password is visible to the MCP client and the model it serves, and may be kept in the conversation. That is outside this server's control. |

### Dependency audit

`make audit` runs npm audit over every locked dependency, development
tools included; CI runs it on every push. Advisories in transitive
development dependencies are constrained with `overrides` in
`package.json` so no affected version resolves. Dependabot proposes
weekly updates of `package-lock.json` and of the pinned workflow
actions.
