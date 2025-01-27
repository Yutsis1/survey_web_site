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
//  todo
// create css styles with left-right shadow
// creaete the logick of clikcing

// Create checkboxes
// Create togle box

// create range selector 

// text input