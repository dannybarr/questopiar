import { NavLink, useLocation } from "react-router-dom";
import { Compass, Flame, Sparkles, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { to: "/quests", label: "Quests", Icon: Sparkles },
  { to: "/active", label: "Active", Icon: Flame },
  { to: "/discover", label: "Discover", Icon: Compass },
  { to: "/profile", label: "Profile", Icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky bottom-0 z-40 px-4 pb-4 pt-2 pointer-events-none">
      <div className="pointer-events-auto mx-auto flex max-w-[440px] items-center justify-between rounded-full border-2 border-foreground bg-card px-2 py-2 shadow-sticker-lg">
        {tabs.map(({ to, label, Icon }) => {
          const active = pathname === to || (to === "/quests" && pathname === "/");
          return (
            <NavLink key={to} to={to} className="relative flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative mx-auto flex h-12 items-center justify-center gap-1.5 rounded-full px-3 transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.5} />
                {active && <span className="text-sm font-bold">{label}</span>}
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
