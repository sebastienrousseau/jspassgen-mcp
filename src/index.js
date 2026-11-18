// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Public entry point of @sebastienrousseau/jspassgen-mcp.
 *
 * @module jspassgen-mcp
 */

export { createServer, SERVER_NAME, SERVER_VERSION } from "./server.js";
export {
  TOOL_NAME,
  LENGTH_LIMITS,
  PASSWORD_TYPE,
  createGeneratePasswordHandler,
} from "./tools/generate-password.js";
