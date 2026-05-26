import {
  LayoutDashboard,
  MessageSquare,
  Users,
  GitBranch,
  Video,
  CheckSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  mobileLabel: string;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", mobileLabel: "Dashboard" },
  { href: "/chat", icon: MessageSquare, label: "Chat", mobileLabel: "Chat" },
  { href: "/developers", icon: Users, label: "Developers", mobileLabel: "Developers" },
  { href: "/repos", icon: GitBranch, label: "Repositories", mobileLabel: "Repos" },
  { href: "/meetings", icon: Video, label: "Meetings", mobileLabel: "Meetings" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks", mobileLabel: "Tasks" },
];
