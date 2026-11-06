"use client";

import { useSyncExternalStore } from "react";
import {
  ACTION_STATUSES,
  DEFAULT_ACTION_ITEMS,
  type ActionItem,
} from "@/models/constants/actionPlan";

// Session-local like the prototype: edits survive navigation and refresh, but
// aren't saved anywhere else or shared with other people.
const STORAGE_KEY = "strategic-plan-actions";

let items: ActionItem[] | null = null;
const listeners = new Set<() => void>();

function isActionItem(value: unknown): value is ActionItem {
  const item = value as ActionItem;
  return (
    typeof item?.id === "string" &&
    typeof item.text === "string" &&
    typeof item.quarter === "string" &&
    ACTION_STATUSES.includes(item.status)
  );
}

function readStoredItems() {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    return Array.isArray(parsed) && parsed.every(isActionItem) ? parsed : null;
  } catch {
    return null;
  }
}

function getItems() {
  items ??= readStoredItems() ?? DEFAULT_ACTION_ITEMS;
  return items;
}

function setItems(next: ActionItem[]) {
  items = next;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked. Edits still last until the page is refreshed.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getServerItems = () => DEFAULT_ACTION_ITEMS;

export function useActionPlan() {
  const current = useSyncExternalStore(subscribe, getItems, getServerItems);

  return {
    items: current,
    updateItem: (id: string, changes: Partial<Omit<ActionItem, "id">>) =>
      setItems(current.map((item) => (item.id === id ? { ...item, ...changes } : item))),
    cycleStatus: (id: string) =>
      setItems(
        current.map((item) => {
          if (item.id !== id) return item;
          const next = (ACTION_STATUSES.indexOf(item.status) + 1) % ACTION_STATUSES.length;
          return { ...item, status: ACTION_STATUSES[next] };
        }),
      ),
    addItem: () => {
      const id = `action-${Date.now()}`;
      setItems([...current, { id, text: "", quarter: "", status: "Planned" }]);
      return id;
    },
    removeItem: (id: string) => setItems(current.filter((item) => item.id !== id)),
    resetItems: () => setItems(DEFAULT_ACTION_ITEMS),
  };
}
