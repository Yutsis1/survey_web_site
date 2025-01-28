'use client'

import React, { useState } from "react";
import "./checkbox.css"

interface CheckboxProps {
  activeLabel: string;
  inactiveLabel: string;
  test_id?: string;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ activeLabel, inactiveLabel, className, test_id }) => { 
  const [isChecked, setIsChecked] = useState(false);
  const test_id_internal = test_id ? test_id : Math.random().toString(36).substring(7);
  const id = `${test_id_internal}_${activeLabel}`;
  

  return (
    <div className={`checkbox-wrapper ${className || ''}`}>
      <div className='block'>
        <input 
          type="checkbox" 
          data-index="0" 
          data-testid={test_id} 
          id={id}
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
        />
        <label htmlFor={id}></label>
          <span className="checkbox-label">
            {isChecked ? activeLabel : inactiveLabel}
          </span>
      </div>
    </div>
  );
};

export { Checkbox };
