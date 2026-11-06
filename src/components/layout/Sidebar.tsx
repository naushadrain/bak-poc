"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { isActivePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/models/constants/navigation";

interface SidebarProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

interface NavListProps {
  pathname: string | null;
  onClose: () => void;
}

function NavList({ pathname, onClose }: NavListProps) {
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = pathname !== null && isActivePath(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-stone font-medium text-ink"
                  : "text-ink2 hover:bg-stone/60 hover:text-ink",
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn("size-4 shrink-0", isActive && "text-taupe")}
              />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveNavList({ onClose }: { onClose: () => void }) {
  return <NavList pathname={usePathname()} onClose={onClose} />;
}

export function Sidebar({ id, isOpen, onClose }: SidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-ink/10 bg-paper duration-200 lg:visible lg:translate-x-0",
          // Only animate visibility on close: it must apply at once on open so the drawer can take focus.
          isOpen
            ? "visible translate-x-0 transition-[translate]"
            : "invisible -translate-x-full transition-[translate,visibility]",
        )}
      >
        <div className="flex items-start justify-between gap-2 px-5 pt-5 pb-4">
          <div>
            <p className="text-xs text-ink2">Wasael Property Management</p>
            <p className="mt-1 text-lg leading-tight font-semibold text-ink">
              Portfolio Intelligence
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="-mt-1 -mr-2 rounded-md p-2 text-ink2 hover:bg-stone hover:text-ink lg:hidden"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 pb-4">
          {/* On routes with runtime params the pathname resolves at request time. */}
          <Suspense fallback={<NavList pathname={null} onClose={onClose} />}>
            <ActiveNavList onClose={onClose} />
          </Suspense>
        </nav>
      </aside>
    </>
  );
}
