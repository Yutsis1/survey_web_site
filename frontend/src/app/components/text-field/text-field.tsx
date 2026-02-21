import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  test_id?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
    <div className="relative">
      <Input
        type={resolvedType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        id={id}
        name={name}
        className={cn("text-foreground", canTogglePassword ? "pr-11" : "")}
      />
      {canTogglePassword && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setIsPasswordVisible((prev) => !prev)}
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          aria-pressed={isPasswordVisible}
        >
          {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-2", className)} data-testid={test_id}>
      {label ? (
        <Label htmlFor={id} className="text-foreground">
          {label}
          {inputControl}
        </Label>
      ) : (
        inputControl
      )}
    </div>
  );
};

export { TextInput };
