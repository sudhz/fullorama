/**
 * Shared extension-storage mock for tests.
 *
 * `src/platform/extension-api` captures `chrome` when it is first imported, so
 * import this module before any source module, and reset the store between
 * tests instead of replacing it.
 */

export const store: Record<string, unknown> = {};

Object.assign(globalThis, {
    chrome: {
        storage: {
            local: {
                get: async (keys: string[]) =>
                    Object.fromEntries(keys.filter((key) => key in store).map((key) => [key, store[key]])),
                set: async (values: Record<string, unknown>) => {
                    Object.assign(store, values);
                },
                remove: async (key: string) => {
                    delete store[key];
                },
            },
            onChanged: {
                addListener: () => {},
            },
        },
    },
});

export function resetStore(): void {
    for (const key of Object.keys(store)) {
        delete store[key];
    }
}
