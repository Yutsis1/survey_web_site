
import React from "react";
import { componentMapping, ComponentPropsMapping, Option } from "../interfaceMapping";


export interface QuestionProps<T extends keyof ComponentPropsMapping> {
  questionText: string;
  component: T;
  options: Option<ComponentPropsMapping[T]>[];
}


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
