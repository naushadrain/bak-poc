"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useActionPlan } from "@/controllers/hooks/useActionPlan";
import { cn } from "@/lib/utils";
import type { ActionStatus } from "@/models/constants/actionPlan";

const STATUS_STYLES: Record<ActionStatus, string> = {
  Planned: "border-ink/20 bg-stone",
  "In Progress": "border-taupe/50 bg-taupe/20",
  Completed: "border-good/40 bg-good/15",
};

const FIELD_CLASSES =
  "rounded-md border border-transparent bg-transparent px-2 py-1 text-ink placeholder:text-ink2 hover:border-ink/20 focus:border-ink/20 focus:bg-paper";

export function StrategicPlan() {
  const { items, updateItem, cycleStatus, addItem, removeItem, resetItems } = useActionPlan();
  const [focusId, setFocusId] = useState<string | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const openCount = items.filter((item) => item.status !== "Completed").length;
  const completedCount = items.length - openCount;

  // Runs after the new row has rendered, so its field exists to take focus.
  useEffect(() => {
    if (focusId) document.getElementById(`${focusId}-text`)?.focus();
  }, [focusId]);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Quarterly Action Plan"
          subtitle={`${openCount} open, ${completedCount} completed. Click text to edit and a status to change it. Changes last for this browser session only.`}
        />
        <button
          type="button"
          onClick={resetItems}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-ink2 hover:bg-stone hover:text-ink"
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
          Reset
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink2">No actions yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          <AnimatePresence initial={false}>
            {items.map(({ id, text, quarter, status }) => (
              <motion.li
                key={id}
                layout="position"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 py-2">
                  <textarea
                    id={`${id}-text`}
                    rows={1}
                    value={text}
                    placeholder="Describe the action"
                    aria-label="Action"
                    onChange={(event) => updateItem(id, { text: event.target.value })}
                    className={cn(FIELD_CLASSES, "field-sizing-content min-w-48 flex-1 basis-64 resize-none text-sm")}
                  />
                  <input
                    value={quarter}
                    placeholder="Quarter"
                    aria-label={`Quarter for ${text || "new action"}`}
                    onChange={(event) => updateItem(id, { quarter: event.target.value })}
                    className={cn(FIELD_CLASSES, "w-20 text-xs text-ink2")}
                  />
                  <button
                    type="button"
                    onClick={() => cycleStatus(id)}
                    aria-label={`Status: ${status}. Change status of ${text || "new action"}`}
                    className={cn(
                      "w-24 rounded-full border px-2 py-0.5 text-center text-xs font-medium whitespace-nowrap text-ink",
                      STATUS_STYLES[status],
                    )}
                  >
                    {status}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeItem(id);
                      addButtonRef.current?.focus();
                    }}
                    aria-label={`Remove ${text || "new action"}`}
                    className="ml-auto rounded-md p-1.5 text-ink2 hover:bg-stone hover:text-crit"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <button
        ref={addButtonRef}
        type="button"
        onClick={() => setFocusId(addItem())}
        className="flex items-center gap-1.5 self-start rounded-md border border-ink/20 px-3 py-1.5 text-sm text-ink hover:bg-stone"
      >
        <Plus aria-hidden="true" className="size-4" />
        Add action
      </button>
    </Card>
  );
}
