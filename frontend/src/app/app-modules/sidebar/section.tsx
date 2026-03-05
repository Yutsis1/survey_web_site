import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const Section: React.FC<SectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className,
  contentClassName,
}) => {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-3", className)}>
      {(title || description) && (
        <div className={children ? "mb-3" : ""}>
          {title && (
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              {Icon && <Icon className="h-4 w-4 text-primary" />}
              {title}
            </div>
          )}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      {children && <div className={contentClassName}>{children}</div>}
    </div>
  );
};

export { Section };
