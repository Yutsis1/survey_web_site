import { Checkbox } from "@/app/components/checkbox/checkbox";
import { RadioBar } from "@/app/components/radios/radio-bar";
import { TextInput } from "@/app/components/text-field/text-field";
import React from "react";

interface Option {
  activeLabel: string;
  inactiveLabel: string;
  label: string;
  value: string;
  component: "TextInput" | "Checkbox" | "RadioBar";
}

interface QuestionProps {
  questionText: string;
  options: Option[];
  onOptionChange: (index: number, value: string) => void;
}

const componentMapping = {
  TextInput: TextInput,
  Checkbox: Checkbox,
  RadioBar: RadioBar,
};

const Question: React.FC<QuestionProps> = ({ questionText, options, onOptionChange }) => {
  return (
    <div className="question">
      <h3>{questionText}</h3>
      {options.map((option, index) => {
        const Component = componentMapping[option.component];
        return (
          <div key={index} className="option">
            <Component
              buttons={[]} name={""} label={option.label}
              value={option.value}
              onChange={(e) => onOptionChange(index, e.target.value)}
              {...(option.component === "Checkbox" && { activeLabel: option.activeLabel || "Active", inactiveLabel: option.inactiveLabel || "Inactive" })}            />
          </div>
        );
      })}
    </div>
  );
};

export { Question };