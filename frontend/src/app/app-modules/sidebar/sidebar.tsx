import React from "react";
import { Button, ButtonProps } from "@/app/components/button/button";
import { FilePlus2, LogOut, Save, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  buttons: ButtonProps[];
}

const iconByLabel: Record<string, React.ReactNode> = {
  "New Question": <FilePlus2 className="h-4 w-4" />,
  "Clear Questions": <Trash2 className="h-4 w-4" />,
  "Save Survey": <Save className="h-4 w-4" />,
  "Saving...": <Save className="h-4 w-4" />,
  "Loading...": <Save className="h-4 w-4" />,
  "Load Survey": <Upload className="h-4 w-4" />,
  Logout: <LogOut className="h-4 w-4" />,
};

const Sidebar: React.FC<SidebarProps> = ({ buttons }) => {
  return (
    <div className="rounded-xl border border-border bg-[#111111] p-3">
      <ul className="space-y-2">
        {buttons.map((button, index) => (
          <li key={index} className="sidebar-button-item">
            <Button
              label={
                <span className="inline-flex items-center gap-2">
                  {iconByLabel[String(button.label)]}
                  {button.label}
                </span>
              }
              onClick={button.onClick}
              className={cn(
                "w-full justify-start border border-border bg-[#171717] hover:bg-[#1f1f1f]",
                String(button.label).toLowerCase().includes("logout") &&
                  "border-destructive/35 text-destructive hover:bg-destructive/20",
                button.className
              )}
              test_id={button.test_id || undefined}
              disabled={button.disabled}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export { Sidebar };
