// Shim for 'redis' when running in Cloudflare Workers.
// This file is aliased to the 'redis' package during Worker builds so
// the real Node-only client is not bundled into the Worker.

export function createClient() {
  return {
    connect: async () => {},
    on: () => {},
    get: async (_key) => null,
    setEx: async (_key, _ttl, _value) => {},
    disconnect: async () => {}
  }
}
