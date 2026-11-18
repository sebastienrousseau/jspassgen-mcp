#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0 OR MIT
//
// Start bin/jspassgen-mcp.js as a child process, talk MCP to it over
// stdio as any MCP client would, and call generate_password once.
// Everything stays on this machine: no network, no log.
//
// Usage: node examples/generate-password.mjs [length]

import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const server = fileURLToPath(
  new URL("../bin/jspassgen-mcp.js", import.meta.url),
);
const length = process.argv[2] === undefined ? 20 : Number(process.argv[2]);

const client = new Client({ name: "example", version: "0.0.0" });
await client.connect(
  new StdioClientTransport({ command: process.execPath, args: [server] }),
);
try {
  const { tools } = await client.listTools();
  process.stdout.write(`tools: ${tools.map((t) => t.name).join(", ")}\n`);
  const result = await client.callTool({
    name: "generate_password",
    arguments: { length },
  });
  if (result.isError) {
    process.stdout.write(`error: ${result.content[0].text}\n`);
    process.exitCode = 1;
  } else {
    const { password, entropyBits, securityLevel } = result.structuredContent;
    process.stdout.write(`password: ${password}\n`);
    process.stdout.write(`entropy:  ${entropyBits} bits (${securityLevel})\n`);
  }
} finally {
  await client.close();
}
