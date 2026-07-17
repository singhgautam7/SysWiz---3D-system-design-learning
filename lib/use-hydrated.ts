"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True once rendering on the client, false during SSR / first hydration pass.
 * Use to gate UI that depends on persisted (localStorage) store values so the
 * first client render matches the server render and avoids hydration mismatches.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
