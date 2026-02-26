import { useEffect, useState } from 'react';
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
  test_id?: string;
}

export function DropDown({
  options,
  selectedOption,
  onSelect,
  label,
  id,
  name,
  disabled = false,
  test_id,
}: DropDownProps) {
  const [internalSelectedOption, setInternalSelectedOption] = useState(selectedOption);

  useEffect(() => {
    setInternalSelectedOption(selectedOption);
  }, [selectedOption]);

  const currentSelectedOption = internalSelectedOption;

  const handleSelect = (value: string) => {
    setInternalSelectedOption(value);
    onSelect(value);
  };

  return (
    <div className="space-y-2" data-testid={test_id}>
      {label && <Label htmlFor={id ?? name}>{label}</Label>}
      <select
        className="sr-only"
        data-testid={test_id ? `${test_id}-native` : undefined}
        id={id}
        name={name}
        value={currentSelectedOption}
        onChange={(e) => handleSelect(e.target.value)}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Select value={currentSelectedOption} onValueChange={handleSelect} disabled={disabled}>
        <SelectTrigger id={id ? `${id}-trigger` : undefined} name={name} data-testid={test_id ? `${test_id}-trigger` : undefined}>
          <SelectValue placeholder="Select one option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} data-testid={test_id ? `${test_id}-item-${option.value}` : undefined}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
