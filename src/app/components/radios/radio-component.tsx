import React from "react";
import "./radio-component.css";

interface RadioProps {
  label: string;
  test_id?: string;
  className?: string;
}

const Radio: React.FC<RadioProps> = ({ label, className, test_id }) => {
  return (
    <div className={className} data-testid={test_id}>
      <span>
        <input type="radio" name="radio-examples" />
        <label>{label}</label>
      </span>
    </div>
  );
};

export { Radio };

// TODO
// add radiobuttons bar
// if selected one, another should be unselected
