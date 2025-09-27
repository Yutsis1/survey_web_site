import React from "react";
import "./button.css"


export interface ButtonProps {
    label: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    test_id?: string;
    disabled?: boolean;
    name?: string;
}

const Button: React.FC<ButtonProps> = ({ label, className = 'button-base', test_id, onClick, disabled, name }) => {
    return (
        <button className={className} data-testid={test_id} onClick={onClick} disabled={disabled} name={name}>
            {label}
        </button>
    );
};

export { Button };
