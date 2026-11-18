// SPDX-License-Identifier: Apache-2.0 OR MIT

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/index.js";

/**
 * Connect an MCP client to a fresh server over an in-memory transport
 * pair. Returns the client and a `close` that shuts both ends.
 */
export async function connectInMemory(options) {
  const server = createServer(options);
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "jspassgen-mcp-test", version: "0.0.0" });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  const close = async () => {
    await client.close();
    await server.close();
  };
  return { client, close };
}

/** The base64 alphabet jspassgen's strong type draws from. */
export const BASE64 = /^[A-Za-z0-9+/]+$/;
