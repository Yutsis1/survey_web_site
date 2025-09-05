import React from "react";
import "./text-field.css";

export interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  test_id?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  id?: string;
  name?: string;
}

const TextInput: React.FC<TextFieldProps> = ({
  label,
  placeholder = "Enter text...",
  value,
  test_id,
  onChange,
  type = "text",
  className = "",
  id,
  name,
}) => {
  return (
    <div className={`text-input-container ${className}`} data-testid={test_id}>
      {label ? (
        <label className="text-input-label">
          {label}
          <input
            type={type}
            className="text-input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            id={id}
            name={name}
          />
        </label>
      ) : (
        <input
          type={type}
          className="text-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          id={id}
          name={name}
        />
      )}
    </div>
  );
};

export { TextInput };