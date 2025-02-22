import React from "react";
import "./button.css"


export interface ButtonProps {
    label: string;
    onClick?: () => void;
    className?: string;
    test_id?: string;
}

const Button: React.FC<ButtonProps> = ({ label, className='button-base', test_id, onClick }) => {
    return (
        <button className={className} data-testid={test_id || undefined} onClick={onClick}>{label}</button>
    );
};

export { Button };
