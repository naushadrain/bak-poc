"use client";

import { useSyncExternalStore } from "react";

function subscribe(onTick: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    // Aim for the next whole second so the display doesn't drift or skip.
    timer = setTimeout(() => {
      onTick();
      schedule();
    }, 1000 - (Date.now() % 1000));
  };
  schedule();
  return () => clearTimeout(timer);
}

const getSeconds = () => Math.floor(Date.now() / 1000);
const getServerSeconds = () => null;

/** Returns the current time, updated every second, or null until running in the browser. */
export function useLiveClock(): Date | null {
  const seconds = useSyncExternalStore<number | null>(subscribe, getSeconds, getServerSeconds);
  return seconds === null ? null : new Date(seconds * 1000);
}
