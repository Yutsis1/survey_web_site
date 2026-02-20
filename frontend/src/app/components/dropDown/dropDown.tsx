import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
        {label && <Label htmlFor={id ?? name}>{label}</Label>}
        <select
          className="sr-only"
          id={id}
          name={name}
          value={selectedOption}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Select value={selectedOption} onValueChange={onSelect} disabled={disabled}>
          <SelectTrigger id={id ? `${id}-trigger` : undefined} name={name}>
            <SelectValue placeholder="Select one option" />
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
