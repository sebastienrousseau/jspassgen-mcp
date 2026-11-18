// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * The MCP server: one McpServer with the jspassgen tools registered.
 * Transport-agnostic; `bin/jspassgen-mcp.js` connects it to stdio.
 *
 * @module server
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import pkg from "../package.json" with { type: "json" };
import {
  TOOL_NAME,
  toolConfig,
  createGeneratePasswordHandler,
} from "./tools/generate-password.js";

/** The name the server reports in the MCP handshake. */
export const SERVER_NAME = "jspassgen-mcp";

/** The version the server reports: the package version. */
export const SERVER_VERSION = pkg.version;

/**
 * Create the server with every tool registered.
 *
 * @param {object} [options]
 * @param {object} [options.service] A jspassgen core service to use in
 *   place of the default Node.js `crypto` one (tests inject one).
 * @returns {McpServer} The server, not yet connected.
 */
export function createServer({ service } = {}) {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  server.registerTool(
    TOOL_NAME,
    toolConfig,
    createGeneratePasswordHandler(service),
  );
  return server;
}
