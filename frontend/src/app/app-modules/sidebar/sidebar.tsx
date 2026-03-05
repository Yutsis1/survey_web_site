import React from "react";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ children, className }) => {
  return (
    <aside className={cn("sidebar border-r border-border bg-card/70 p-4 backdrop-blur-md", className)}>
      <div className="space-y-3">{children}</div>
    </aside>
  );
};

export { Sidebar };
