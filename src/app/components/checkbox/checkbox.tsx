"use client";

import React, { useState } from "react";
import "./checkbox.css";

interface ToggleSwitchProps {
  activeLabel?: string;
  inactiveLabel?: string;
  initialState?: boolean;
}

const Checkbox: React.FC<ToggleSwitchProps> = ({
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  initialState = false,
}) => {
  const [isChecked, setIsChecked] = useState(initialState);

  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => setIsChecked(!isChecked)}
      />
      <span className="slider"></span>
      <span className="label">{isChecked ? activeLabel : inactiveLabel}</span>
    </label>
  );
};

export { Checkbox };
