import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

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

  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-2", className)} data-testid={test_id}>
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          id={inputId}
          name={name}
          className={cn(
            canTogglePassword && "pr-16"
          )}
        />
        {canTogglePassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            aria-pressed={isPasswordVisible}
          >
            {isPasswordVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export { TextInput };
