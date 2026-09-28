import { Link, NavLink, useLocation } from "react-router";
import { LayoutGrid, UserRound } from "lucide-react";

import { SyncStatus } from "@/components/SyncStatus/SyncStatus";
import { useCurrentUser } from "@/hooks/useDevboard";
import { cn } from "@/lib/utils";
import "./Navbar.scss";

type NavItem = {
  to: string;
  label: string;
  /** Zusätzliche Pfad-Präfixe, bei denen der Link als aktiv gilt */
  activePrefixes: string[];
};

const NAV_ITEMS: NavItem[] = [
  { to: "/boards", label: "Boards", activePrefixes: ["/boards", "/board/"] },
  { to: "/profile", label: "Profil", activePrefixes: ["/profile"] },
];

export function Navbar() {
  const { pathname } = useLocation();
  const currentUser = useCurrentUser();

  return (
    <header className="navbar sticky top-0 z-40 bg-nav text-nav-foreground">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4 sm:gap-6">
        <Link
          to="/boards"
          className="navbar__brand flex items-center gap-2 text-base font-semibold"
          aria-label="Devboard – zur Boards-Übersicht"
        >
          <LayoutGrid className="size-4" aria-hidden />
          <span>Devboard</span>
        </Link>

        <ul className="flex items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.activePrefixes.some((prefix) => pathname.startsWith(prefix));
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn("navbar__link px-2 py-1 text-sm", isActive && "is-active")}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto">
          <SyncStatus />
        </div>

        <Link
          to="/profile"
          className="navbar__user flex min-w-0 items-center gap-2 rounded-md px-2 py-1 text-sm"
          title="Zum Profil"
        >
          <UserRound className="size-4 shrink-0" aria-hidden />
          <span className="max-w-32 truncate">{currentUser?.name ?? "Profil anlegen"}</span>
        </Link>
      </nav>
    </header>
  );
}
