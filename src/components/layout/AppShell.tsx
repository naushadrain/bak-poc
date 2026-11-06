"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const SIDEBAR_ID = "app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const menuButton = menuButtonRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    // Past the lg breakpoint the drawer is the permanent rail, so leave menu mode.
    const desktop = window.matchMedia("(min-width: 64rem)");
    const handleResize = () => {
      if (desktop.matches) closeMenu();
    };

    document.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleResize);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleResize);
      // Runs after the close commits, once the page behind the drawer is no longer inert.
      menuButton?.focus();
    };
  }, [isMenuOpen, closeMenu]);

  return (
    // Follows the viewer's reduced-motion setting across every animation.
    <MotionConfig reducedMotion="user">
      <Sidebar id={SIDEBAR_ID} isOpen={isMenuOpen} onClose={closeMenu} />
      {/* inert keeps keyboard focus inside the drawer while it is open. */}
      <div inert={isMenuOpen} className="flex min-h-screen flex-col lg:pl-60">
        <Header
          menuButtonRef={menuButtonRef}
          isMenuOpen={isMenuOpen}
          menuId={SIDEBAR_ID}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </MotionConfig>
  );
}
