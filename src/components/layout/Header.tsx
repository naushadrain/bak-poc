"use client";

import { Suspense, type Ref } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu } from "lucide-react";
import { useLiveClock } from "@/controllers/hooks/useLiveClock";
import { getBreadcrumbs } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

// A separate component so the per-second update only re-renders the clock.
function LiveClock() {
  const now = useLiveClock();

  return (
    <div className="shrink-0 text-right">
      <time
        dateTime={now?.toISOString()}
        className="block text-sm font-medium whitespace-nowrap text-ink tabular-nums"
      >
        {now ? timeFormat.format(now) : "--:--:--"}
        <span className="ml-1 hidden text-xs font-normal text-ink2 sm:inline">GST</span>
      </time>
      <p className="hidden text-xs whitespace-nowrap text-ink2 sm:block">
        {now ? dateFormat.format(now) : " "}
      </p>
    </div>
  );
}

function PageHeading() {
  const breadcrumbs = getBreadcrumbs(usePathname());
  const pageTitle = breadcrumbs[breadcrumbs.length - 1].label;

  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-xs text-ink2">
          {breadcrumbs.map((crumb, index) => {
            const isCurrent = index === breadcrumbs.length - 1;
            return (
              <li
                key={crumb.href}
                className={cn("flex items-center gap-1", isCurrent ? "min-w-0" : "shrink-0")}
              >
                {index > 0 && (
                  <ChevronRight aria-hidden="true" className="size-3 shrink-0" />
                )}
                {isCurrent ? (
                  <span aria-current="page" className="truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-ink hover:underline">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <h1 className="truncate font-display text-base text-ink sm:text-xl">{pageTitle}</h1>
    </>
  );
}

interface HeaderProps {
  menuButtonRef: Ref<HTMLButtonElement>;
  isMenuOpen: boolean;
  menuId: string;
  onOpenMenu: () => void;
}

export function Header({ menuButtonRef, isMenuOpen, menuId, onOpenMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-stone px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation menu"
        aria-expanded={isMenuOpen}
        aria-controls={menuId}
        className="-ml-2 shrink-0 rounded-md p-2 text-ink2 hover:bg-paper hover:text-ink lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      <div className="min-w-0 flex-1">
        {/* On routes with runtime params the pathname resolves at request time. */}
        <Suspense fallback={<div className="h-11" />}>
          <PageHeading />
        </Suspense>
      </div>

      <LiveClock />

      <Image
        src="/wasael-logo.svg"
        alt="Wasael Property Management"
        width={64}
        height={44}
        unoptimized
        className="h-11 w-auto shrink-0"
      />
    </header>
  );
}
