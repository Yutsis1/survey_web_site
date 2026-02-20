"use client";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface ToggleSwitchProps {
  activeLabel?: string;
  inactiveLabel?: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
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

  const handleChange = (newChecked: boolean) => {
    setIsChecked(newChecked);
    onChange(newChecked);
  };

  React.useEffect(() => {
    setIsChecked(checked ?? false);
  }, [checked]);

  const switchId = id || name || "toggle-switch";

  return (
    <div className="flex items-center gap-3">
      <Switch
        id={switchId}
        checked={isChecked}
        onCheckedChange={handleChange}
        name={name}
      />
      <Label htmlFor={switchId} className="text-sm text-foreground cursor-pointer">
        {isChecked ? activeLabel : inactiveLabel}
      </Label>
    </div>
  );
};

export { Checkbox };
