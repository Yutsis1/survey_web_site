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

const RadioBar: React.FC<RadioBarProps> = ({ buttons, name, test_id, onChange, selectedValue }) => {
    const [internalSelectedValue, setInternalSelectedValue] = useState<string | null>(null);
     // Use external selectedValue if provided, otherwise use internal state
    const currentSelectedValue = selectedValue ?? internalSelectedValue;


  const handleChange = (value: string) => {
    setInternalSelectedValue(value);
    onChange?.(value); // Call the external onChange if provided
  };

  return (
    <div className="radio-bar" data-testid={test_id}>
      {buttons.map((button, index) => (
        <label key={index} className="radio-wrapper">
          <input
            type="radio"
            name={name}
            value={button.value}
            checked={currentSelectedValue === button.value}
            onChange={() => handleChange(button.value)}
          />
          <span className="radio-label">{button.label}</span>
        </label>
      ))}
    </div>
  );
};

export { RadioBar };