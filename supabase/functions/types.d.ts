// Deno runtime type declarations for Supabase Edge Functions
// This file helps VS Code understand Deno APIs without installing the Deno extension

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    has(key: string): boolean;
    toObject(): Record<string, string>;
  }

  export const env: Env;

  export interface ServeOptions {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onListen?: (params: { hostname: string; port: number }) => void;
    onError?: (error: unknown) => Response | Promise<Response>;
  }

  export type ServeHandler = (
    request: Request,
    info?: { remoteAddr: { hostname: string; port: number } }
  ) => Response | Promise<Response>;

  export function serve(
    handler: ServeHandler,
    options?: ServeOptions
  ): void;
}
