import React, { useEffect, useState } from "react";
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
  showPasswordToggle?: boolean;
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
  showPasswordToggle = false,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const canTogglePassword = showPasswordToggle && type === "password";
  const resolvedType =
    canTogglePassword && isPasswordVisible ? "text" : type;

  useEffect(() => {
    if (!canTogglePassword) {
      setIsPasswordVisible(false);
    }
  }, [canTogglePassword]);

  const inputControl = (
    <div className="text-input-control">
      <input
        type={resolvedType}
        className="text-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        id={id}
        name={name}
      />
      {canTogglePassword && (
        <button
          type="button"
          className="text-input-toggle"
          onClick={() => setIsPasswordVisible((prev) => !prev)}
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          aria-pressed={isPasswordVisible}
        >
          {isPasswordVisible ? "Hide" : "Show"}
        </button>
      )}
    </div>
  );

  return (
    <div className={`text-input-container ${className}`} data-testid={test_id}>
      {label ? (
        <label className="text-input-label">
          {label}
          {inputControl}
        </label>
      ) : (
        inputControl
      )}
    </div>
  );
};

export { TextInput };
