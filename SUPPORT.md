<!-- SPDX-License-Identifier: Apache-2.0 OR MIT -->

# Getting support

## Read first

- [README.md](README.md): install, quick start, the tool and its limits.
- [The examples](examples/): a runnable MCP client; CI runs it.
- [DEVELOPMENT.md](DEVELOPMENT.md): setup, testing and every CI gate.

## Supported versions

The latest release is `0.0.24`, the third jspassgen suite release.
While pre-`1.0`, the latest released `0.0.x` is supported; older ones
are not.

| Version | Status | Supported |
| :--- | :--- | :--- |
| `0.0.24` | Latest release | Yes |
| `0.0.23` | Superseded | No |
| `0.0.22` | Superseded | No |
| `main` | In development | Yes |

## Questions and bugs

Open an [issue](https://github.com/sebastienrousseau/jspassgen-mcp/issues/new/choose).
For a bug, include the version or commit, your Node.js version, the MCP
client, and the tool call that failed. Never paste a password you use.

How a password is generated (its alphabet, length limits, entropy)
belongs in [jspassgen's issues](https://github.com/sebastienrousseau/jspassgen/issues).

## Security

Never report a vulnerability in a public issue; follow
[SECURITY.md](SECURITY.md).

## Response times

The project is maintained in a personal capacity, with no SLA. The goal
is a first answer within a few working days.
