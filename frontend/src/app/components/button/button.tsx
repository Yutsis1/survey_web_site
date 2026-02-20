import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ButtonProps {
    label: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    test_id?: string;
    disabled?: boolean;
    name?: string;
}

const Button: React.FC<ButtonProps> = ({ label, className, test_id, onClick, disabled, name }) => {
    const variant = className?.includes("secondary") || className?.includes("cancel")
        ? "outline"
        : className?.includes("destructive") || className?.includes("danger")
            ? "destructive"
            : className?.includes("ghost")
                ? "ghost"
                : "default";

    return (
        <ShadcnButton
            variant={variant}
            className={cn("transition-all", className)}
            data-testid={test_id}
            onClick={onClick}
            disabled={disabled}
            name={name}
        >
            {label}
        </ShadcnButton>
    );
};

export { Button };
