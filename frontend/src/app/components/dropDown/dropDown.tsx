import './dropDown.css';

export interface DropDownProps {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
  label?: string;
  id?: string;
  name?: string;
}

export function DropDown({
  options,
  selectedOption,
  onSelect,
  label,
  id,
  name,
}: DropDownProps) {
return (
    <div className="dropdown-container">
        {label && <label htmlFor={name} className="dropdown-label">{label}</label>}
        <select
            id={id}
            name={name}
            value={selectedOption}
            onChange={(e) => onSelect(e.target.value)}
            className="dropdown-select"
        >
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);
}
