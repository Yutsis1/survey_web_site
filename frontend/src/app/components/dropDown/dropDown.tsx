import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export interface DropDownOption {
  value: string;
  label: string;
}

export interface DropDownProps {
  options: DropDownOption[];
  selectedOption: string;
  onSelect: (value: string) => void;
  label?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

export function DropDown({
  options,
  selectedOption,
  onSelect,
  label,
  id,
  name,
  disabled = false,
}: DropDownProps) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id ?? name} className="text-sm font-medium text-foreground">
          {label}
        </Label>
      )}
      <Select value={selectedOption} onValueChange={onSelect} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select an option..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
