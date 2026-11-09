import type { IncomingMessage, ServerResponse } from "node:http";

export function createApiHandler(options?: { dbPath?: string }): {
  handleApi: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
};
