"use client";
import React from "react";
import "./checkbox.css";

export interface ToggleSwitchProps {
  activeLabel?: string;
  inactiveLabel?: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<ToggleSwitchProps> = ({
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  checked,
  onChange,
}) => {
  const [isChecked, setIsChecked] = React.useState(checked);
  if (checked === undefined) {
    checked = false; // Default to false if checked is not provided
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    onChange(newChecked);
  };

  React.useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
      />
      <span className="slider"></span>
      <span className="label">{isChecked ? activeLabel : inactiveLabel}</span>
    </label>
  );
};

export { Checkbox };
