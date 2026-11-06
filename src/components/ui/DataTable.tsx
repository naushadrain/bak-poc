"use client";

import { Fragment, useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { SkeletonLoader } from "./SkeletonLoader";

const ALIGN_CLASSES = {
  left: "text-left",
  right: "text-right tabular-nums",
  center: "text-center",
};

export interface DataTableColumn<T> {
  key: string;
  header: string;
  /** The cell's raw value. This is the text that search matches against. */
  value: (row: T) => string | number | null | undefined;
  /** Custom cell content, such as a Badge. Defaults to the raw value. */
  render?: (row: T) => ReactNode;
  align?: keyof typeof ALIGN_CLASSES;
}

interface DataTableProps<T> {
  /** Names the table for screen readers. */
  label: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Sets the height the rows scroll within, for example "max-h-96". */
  scrollClassName?: string;
  className?: string;
  /** Adds an expand button to each row, revealing this content below it. */
  renderExpanded?: (row: T) => ReactNode;
}

/**
 * Columns contain functions, which can't cross from a Server Component to a
 * Client Component, so define them in a Client Component.
 */
export function DataTable<T>({
  label,
  columns,
  rows,
  getRowKey,
  isLoading = false,
  searchPlaceholder = "Search",
  emptyMessage = "No data available.",
  scrollClassName = "max-h-96",
  className,
  renderExpanded,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<string>>(new Set());
  // Keeps typing responsive while a large table filters.
  const deferredQuery = useDeferredValue(query);

  const visibleRows = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();
    if (!search) return rows;
    return rows.filter((row) =>
      columns.some((column) =>
        String(column.value(row) ?? "").toLowerCase().includes(search),
      ),
    );
  }, [rows, columns, deferredQuery]);

  const isFiltering = deferredQuery.trim() !== "";
  const columnCount = columns.length + (renderExpanded ? 1 : 0);

  const toggleRow = (key: string) => {
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  };

  return (
    <Card className={cn("flex min-w-0 flex-col gap-3 p-0", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pt-4">
        <div className="relative w-full sm:w-72">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink2"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={`Search ${label}`}
            autoComplete="off"
            className="w-full rounded-md border border-ink/20 bg-paper py-2 pr-3 pl-9 text-base text-ink placeholder:text-ink2 sm:text-sm"
          />
        </div>
        {!isLoading && (
          <p aria-live="polite" className="text-xs text-ink2 tabular-nums">
            {isFiltering
              ? `${visibleRows.length} of ${rows.length} rows`
              : `${rows.length} rows`}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="px-4 pb-4">
          <SkeletonLoader lines={6} className="h-8 w-full" label={`Loading ${label}`} />
        </div>
      ) : (
        // Focusable so keyboard users can scroll it. The sticky header needs this
        // element to be the scroll container.
        <div
          role="region"
          aria-label={label}
          tabIndex={0}
          className={cn("overflow-auto rounded-b-lg border-t border-ink/10", scrollClassName)}
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {renderExpanded && (
                  <th
                    scope="col"
                    className="sticky top-0 z-10 w-10 bg-stone shadow-[inset_0_-1px_0] shadow-ink/10"
                  >
                    <span className="sr-only">Details</span>
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      "sticky top-0 z-10 bg-stone px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-ink2 shadow-[inset_0_-1px_0] shadow-ink/10",
                      ALIGN_CLASSES[column.align ?? "left"],
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => {
                const key = getRowKey(row);
                const isExpanded = expandedKeys.has(key);
                const stripe = index % 2 === 1 && "bg-stone/50";
                return (
                  <Fragment key={key}>
                    <tr className={cn(stripe)}>
                      {renderExpanded && (
                        <td className="pl-2">
                          <button
                            type="button"
                            onClick={() => toggleRow(key)}
                            aria-expanded={isExpanded}
                            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${key}`}
                            className="flex size-8 items-center justify-center rounded-md text-ink2 hover:bg-stone hover:text-ink"
                          >
                            <motion.span
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.15 }}
                              className="flex"
                            >
                              <ChevronRight aria-hidden="true" className="size-4" />
                            </motion.span>
                          </button>
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          // No wrapping, so narrow screens scroll the table instead of crushing it.
                          className={cn(
                            "px-4 py-2.5 whitespace-nowrap text-ink",
                            ALIGN_CLASSES[column.align ?? "left"],
                          )}
                        >
                          {column.render
                            ? column.render(row)
                            : (column.value(row) ?? "—")}
                        </td>
                      ))}
                    </tr>
                    {renderExpanded && (
                      // Stays mounted while closed so the collapse can animate.
                      <tr className={cn(stripe)}>
                        <td colSpan={columnCount} className="p-0">
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pt-1 pb-4">{renderExpanded(row)}</div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-10 text-center text-ink2">
                    {isFiltering ? `No rows match "${deferredQuery.trim()}".` : emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
