"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  /** Names the tab list for screen readers. */
  label: string;
  tabs: TabItem[];
}

export function Tabs({ label, tabs }: TabsProps) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(tabs[0].id);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    setActiveId(tabs[target].id);
    tabRefs.current.get(tabs[target].id)?.focus();
  };

  return (
    <div className="min-w-0 space-y-6">
      <div
        role="tablist"
        aria-label={label}
        className="flex gap-1 overflow-x-auto border-b border-ink/10"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                if (element) tabRefs.current.set(tab.id, element);
              }}
              id={`${baseId}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${baseId}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-sm whitespace-nowrap transition-colors",
                isActive ? "font-medium text-ink" : "text-ink2 hover:text-ink",
              )}
            >
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId={`${baseId}-indicator`}
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-ink"
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab.id}
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeTab.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
