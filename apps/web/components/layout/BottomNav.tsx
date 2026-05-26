"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  GitBranch,
  Video,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/chat", icon: MessageSquare, label: "Chat" },
  { href: "/developers", icon: Users, label: "Developers" },
  { href: "/repos", icon: GitBranch, label: "Repos" },
  { href: "/meetings", icon: Video, label: "Meetings" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex items-stretch h-16">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 gap-1 text-[10px] transition-colors",
              active ? "text-accent-blue" : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
