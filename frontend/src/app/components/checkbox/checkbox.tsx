"use client";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ToggleSwitchProps {
  activeLabel?: string;
  inactiveLabel?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
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
    onChange?.(newChecked);
  };

  React.useEffect(() => {
    setIsChecked(checked ?? false);
  }, [checked]);

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={isChecked}
        onCheckedChange={(next: boolean) => {
          setIsChecked(next);
          onChange?.(next);
        }}
        id={id}
        name={name}
        aria-label={isChecked ? activeLabel : inactiveLabel}
      />
      <Label
        htmlFor={id}
        className={cn("text-sm text-muted-foreground", isChecked && "text-foreground")}
      >
        {isChecked ? activeLabel : inactiveLabel}
      </Label>
      <input
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        onChange={handleChange}
        id={id}
        name={name}
      />
    </div>
  );
};

export { Checkbox };
