"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useAssetData } from "@/controllers/hooks/useAssetData";
import { isActivePath } from "@/lib/navigation";
import { isNumber, splitPortfolio } from "@/lib/portfolio";
import { getStatus } from "@/lib/status";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/models/constants/navigation";
import type { StatusLevel } from "@/models/constants/thresholds";
import type { AssetMgmt } from "@/models/interfaces";

const STATUS_DOTS: Record<StatusLevel, string> = {
  good: "bg-good",
  warn: "bg-warn",
  crit: "bg-crit",
};

const GROUP_LABEL = "px-3 pb-2 text-[11px] tracking-[0.16em] text-stone/70 uppercase";

function linkClasses(isActive: boolean) {
  return cn(
    "flex items-center gap-3 border-l-2 px-3 py-2 text-sm transition-colors",
    isActive
      ? "border-taupe bg-paper/10 font-medium text-paper"
      : "border-transparent text-stone/80 hover:bg-paper/5 hover:text-paper",
  );
}

interface NavListProps {
  pathname: string | null;
  estates: AssetMgmt[];
  onClose: () => void;
}

function NavList({ pathname, estates, onClose }: NavListProps) {
  return (
    <>
      <p className={GROUP_LABEL}>Navigate</p>
      <ul>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname !== null && isActivePath(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={linkClasses(isActive)}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      {estates.length > 0 && (
        <>
          <p className={cn(GROUP_LABEL, "mt-6")}>Estates</p>
          <ul>
            {estates.map(({ estate_code, asset_health_idx }) => {
              const href = `/property/${encodeURIComponent(estate_code)}`;
              const isActive = pathname !== null && isActivePath(pathname, href);
              const hasScore = isNumber(asset_health_idx);
              return (
                <li key={estate_code}>
                  <Link
                    href={href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={linkClasses(isActive)}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        hasScore ? STATUS_DOTS[getStatus(asset_health_idx)] : "bg-stone/40",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">{estate_code}</span>
                    {hasScore && (
                      <span className="text-xs text-stone/70 tabular-nums">
                        <span className="sr-only">Asset health </span>
                        {asset_health_idx}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}

function ActiveNavList(props: Omit<NavListProps, "pathname">) {
  return <NavList pathname={usePathname()} {...props} />;
}

interface SidebarProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ id, isOpen, onClose }: SidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const assets = useAssetData();
  // The estate list is a shortcut, so it stays hidden if the role can't read it.
  const estates = [...splitPortfolio(assets.data).estates].sort((a, b) =>
    a.estate_code.localeCompare(b.estate_code),
  );

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 transition-opacity duration-200 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        id={id}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-ink duration-200 lg:visible lg:translate-x-0",
          // Only animate visibility on close: it must apply at once on open so the drawer can take focus.
          isOpen
            ? "visible translate-x-0 transition-[translate]"
            : "invisible -translate-x-full transition-[translate,visibility]",
        )}
      >
        <div className="flex items-start justify-between gap-2 border-b border-paper/10 px-5 pt-6 pb-5">
          <div>
            {/* <p className="text-[11px] leading-snug tracking-[0.16em] text-stone/70 uppercase">
              Wasael Property Management
            </p> */}
            <p className="mt-2 font-display text-xl leading-tight text-paper">
              Portfolio Intelligence
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="-mt-1 -mr-2 rounded-md p-2 text-stone/80 hover:bg-paper/10 hover:text-paper lg:hidden"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-5">
          {/* On routes with runtime params the pathname resolves at request time. */}
          <Suspense fallback={<NavList pathname={null} estates={estates} onClose={onClose} />}>
            <ActiveNavList estates={estates} onClose={onClose} />
          </Suspense>
        </nav>
      </aside>
    </>
  );
}
