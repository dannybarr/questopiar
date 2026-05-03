import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { motion } from "framer-motion";

export function AppShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-dvh w-full">
      <div className="phone-frame flex flex-col">
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 pb-2"
        >
          {children}
        </motion.main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
