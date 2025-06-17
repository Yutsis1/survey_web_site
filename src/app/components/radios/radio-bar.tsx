'use client'

import React, { useState } from "react";
import "./radio-bar.css";

interface RadioProps {
  label: string;
  value: string;
}

export interface RadioBarProps {
  buttons: RadioProps[];
  name?: string;
  onChange?: (value: string) => void;
  selectedValue?: string;
  test_id?: string;
}

const RadioBar: React.FC<RadioBarProps> = ({ buttons, name, test_id }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };

  return (
    <div className="radio-bar" data-testid={test_id}>
      {buttons.map((button, index) => (
        <label key={index} className="radio-wrapper">
          <input
            type="radio"
            name={name}
            value={button.value}
            checked={selectedValue === button.value}
            onChange={() => handleChange(button.value)}
          />
          <span className="radio-label">{button.label}</span>
        </label>
      ))}
    </div>
  );
};

export { RadioBar };