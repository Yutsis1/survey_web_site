import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { ButtonProps } from "@/app/components/button/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  buttons: ButtonProps[];
}

const Sidebar: React.FC<SidebarProps> = ({ buttons }) => {
  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-border bg-card p-4">
      <div className="mb-6 px-2">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">SurveyFlow</h2>
        <p className="text-xs text-muted-foreground">Survey Builder</p>
      </div>
      <Separator className="mb-4" />
      <nav className="flex flex-1 flex-col gap-1">
        {buttons.map((button, index) => {
          const variant = button.className?.includes("secondary") || button.className?.includes("cancel")
            ? "ghost"
            : button.className?.includes("destructive") || button.className?.includes("danger")
              ? "destructive"
              : "ghost";

          return (
            <ShadcnButton
              key={index}
              variant={variant}
              className={cn(
                "justify-start h-9 px-3 text-sm font-normal",
                "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={button.onClick}
              data-testid={button.test_id || undefined}
              disabled={button.disabled}
            >
              {button.label}
            </ShadcnButton>
          );
        })}
      </nav>
    </aside>
  );
};

export { Sidebar };
