"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface AnimatedCollapseProps {
  open: boolean;
  children: ReactNode;
}

export function AnimatedCollapse({ open, children }: AnimatedCollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
