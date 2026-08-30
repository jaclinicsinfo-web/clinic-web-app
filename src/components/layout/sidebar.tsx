"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, HeartPulse, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { navGroups, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  /** Fecha o menu ao navegar — usado na versão mobile. */
  onNavigate?: () => void;
}

function isItemActive(pathname: string, item: NavItem) {
  const base = item.children ? item.children[0].href.split("/")[1] : item.href.split("/")[1];
  return pathname === item.href || pathname.startsWith(`/${base}/`) || pathname === `/${base}`;
}

export function Sidebar({ collapsed, onToggleCollapse, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((group) =>
      group.items.forEach((item) => {
        if (item.children) initial[item.label] = isItemActive(pathname, item);
      }),
    );
    return initial;
  });

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4",
            collapsed && "justify-center px-0",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulse className="size-5" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">ClinicERP</p>
              <p className="truncate text-xs text-sidebar-muted">Gestão de clínicas</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5 last:mb-0">
              {!collapsed && (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
                  {group.title}
                </p>
              )}

              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isItemActive(pathname, item);
                  const Icon = item.icon;
                  const hasChildren = Boolean(item.children);
                  const expanded = openGroups[item.label] ?? false;

                  const linkContent = (
                    <>
                      <Icon className="size-[18px] shrink-0" />
                      {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
                      {!collapsed && hasChildren && (
                        <ChevronDown
                          className={cn("size-4 shrink-0 transition-transform", expanded && "rotate-180")}
                        />
                      )}
                    </>
                  );

                  const baseClasses = cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                    active ? "bg-sidebar-active text-white" : "text-sidebar-foreground hover:bg-sidebar-active/60",
                    collapsed && "justify-center px-0",
                  );

                  return (
                    <li key={item.label}>
                      {hasChildren && !collapsed ? (
                        <button
                          type="button"
                          className={baseClasses}
                          onClick={() => setOpenGroups((prev) => ({ ...prev, [item.label]: !prev[item.label] }))}
                          aria-expanded={expanded}
                        >
                          {linkContent}
                        </button>
                      ) : collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={item.href} className={baseClasses} onClick={onNavigate}>
                              {linkContent}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Link href={item.href} className={baseClasses} onClick={onNavigate}>
                          {linkContent}
                        </Link>
                      )}

                      {hasChildren && !collapsed && expanded && (
                        <ul className="mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3 ml-5">
                          {item.children!.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onNavigate}
                                  className={cn(
                                    "block rounded-md px-3 py-2 text-[13px] transition-colors",
                                    childActive
                                      ? "bg-sidebar-active text-white"
                                      : "text-sidebar-muted hover:bg-sidebar-active/50 hover:text-white",
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-sidebar-border p-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-active/60 hover:text-white",
              collapsed && "justify-center px-0",
            )}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
            {!collapsed && <span>Recolher menu</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
