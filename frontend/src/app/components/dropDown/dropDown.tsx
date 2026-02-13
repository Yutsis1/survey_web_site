import './dropDown.css';

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
    <div className="dropdown-container">
        {label && <label htmlFor={id ?? name} className="dropdown-label">{label}</label>}
        <select
            id={id}
            name={name}
            value={selectedOption}
            onChange={(e) => onSelect(e.target.value)}
            className="dropdown-select"
            disabled={disabled}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);
}
