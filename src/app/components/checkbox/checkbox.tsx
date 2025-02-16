"use client";

import React, { useState } from "react";
import "./checkbox.css";

interface ToggleSwitchProps {
  initialState?: boolean;
}

const Checkbox: React.FC<ToggleSwitchProps> = ({ initialState = false }) => {
  const [isChecked, setIsChecked] = useState(initialState);

  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => setIsChecked(!isChecked)}
      />
      <span className="slider"></span>
      <span className="label">{isChecked ? "Active" : "Inactive"}</span>
    </label>
  );
};

export { Checkbox };
