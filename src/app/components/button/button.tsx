import React from "react";
import "./button.css"


interface ButtonProps {
    label: string;
    test_id?: string;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ label, className, test_id }) => {
    return (
        <button className={className} data-testid={test_id}>{label}</button>
    );
};

export { Button };
