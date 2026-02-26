import React from "react";
import { Button as UIButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";


export interface ButtonProps {
    label: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    test_id?: string;
    disabled?: boolean;
    name?: string;
}

const Button: React.FC<ButtonProps> = ({ label, className = 'button-base', test_id, onClick, disabled, name }) => {
    return (
        <UIButton
            className={cn(className === "button-base" ? "" : className)}
            data-testid={test_id}
            onClick={onClick}
            disabled={disabled}
            name={name}
            type="button"
        >
            {label}
        </UIButton>
    );
};

export { Button };
