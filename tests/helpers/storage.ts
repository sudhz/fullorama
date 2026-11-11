/**
 * Shared extension-storage mock for tests.
 *
 * `src/platform/extension-api` captures `chrome` when it is first imported, so
 * every test file must use the same mock instance. Reset the store in place
 * between tests instead of replacing it.
 */

export type Store = Record<string, unknown>;

export const store: Store = {};
export const removed: string[][] = [];

(globalThis as { chrome?: unknown }).chrome = {
    storage: {
        local: {
            get: async (keys: string | string[]) => {
                const list = Array.isArray(keys) ? keys : [keys];
                return Object.fromEntries(
                    list.filter((key) => key in store).map((key) => [key, store[key]]),
                );
            },
            set: async (values: Store) => {
                Object.assign(store, values);
            },
            remove: async (keys: string | string[]) => {
                const list = Array.isArray(keys) ? keys : [keys];
                removed.push(list);
                for (const key of list) {
                    delete store[key];
                }
            },
        },
        onChanged: {
            addListener: () => {},
        },
    },
};

export function resetStore(): void {
    for (const key of Object.keys(store)) {
        delete store[key];
    }
    removed.length = 0;
}
