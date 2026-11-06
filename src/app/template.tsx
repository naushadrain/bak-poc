"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

let isFirstLoad = true;

// A template remounts on navigation, which replays this entry animation. The App
// Router unmounts the old page straight away, so there's no exit animation.
export default function PageTransition({ children }: { children: ReactNode }) {
  // Skipped on first load so server-rendered content isn't sent hidden.
  const [skipAnimation] = useState(isFirstLoad);
  // Reduced motion still applies a starting offset, so leave it out rather than jump.
  const startOffset = useReducedMotion() ? 0 : 8;

  useEffect(() => {
    isFirstLoad = false;
  }, []);

  return (
    <motion.div
      initial={skipAnimation ? false : { opacity: 0, y: startOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex min-w-0 flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
