"use client";
import React from "react";
import "./checkbox.css";

export interface ToggleSwitchProps {
  activeLabel?: string;
  inactiveLabel?: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  name?: string;
}

const Checkbox: React.FC<ToggleSwitchProps> = ({
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  checked,
  onChange,
  id,
  name,
}) => {
  const [isChecked, setIsChecked] = React.useState(checked ?? false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    onChange(newChecked);
  };

  React.useEffect(() => {
    setIsChecked(checked ?? false);
  }, [checked]);

  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        id={id}
        name={name}
      />
      <span className="slider"></span>
      {isChecked ? activeLabel : inactiveLabel}
    </label>
  );
};

export { Checkbox };
