import {
  Checkbox,
  ToggleSwitchProps,
} from "@/app/components/checkbox/checkbox";
import { RadioBar, RadioBarProps } from "@/app/components/radios/radio-bar";
import {
  TextFieldProps,
  TextInput,
} from "@/app/components/text-field/text-field";
import React from "react";

interface Option<T> {
  optionProps: T;
}

export type ComponentPropsMapping = {
  TextInput: TextFieldProps;
  Checkbox: ToggleSwitchProps;
  RadioBar: RadioBarProps;
};

export interface QuestionProps<T extends keyof ComponentPropsMapping> {
  questionText: string;
  component: T;
  options: Option<ComponentPropsMapping[T]>[];
}

const componentMapping = {
  TextInput: TextInput,
  Checkbox: Checkbox,
  RadioBar: RadioBar,
};

const Question: React.FC<QuestionProps<keyof ComponentPropsMapping>> = ({
  questionText,
  options,
  component,
}) => {
  const Component = componentMapping[component] as React.ComponentType<
    ComponentPropsMapping[typeof component]
  >;

  return (
    <div className="question-component">
      <h3>{questionText}</h3>
      {options.map((option, index) => (
        <div key={index} className="option">
          <Component {...option.optionProps} />
        </div>
      ))}
    </div>
  );
};

export { Question };
