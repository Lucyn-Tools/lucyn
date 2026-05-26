"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./navigation";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex items-stretch h-16">
      {navItems.map(({ href, icon: Icon, mobileLabel }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center flex-1 gap-1 text-[10px] transition-colors",
              active ? "text-accent-blue" : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            <Icon size={18} />
            <span>{mobileLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
