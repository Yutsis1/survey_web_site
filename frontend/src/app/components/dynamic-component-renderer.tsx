import { componentMapping, ComponentPropsMapping, Option } from './interfaceMapping';

interface DynamicComponentRendererProps<T extends keyof ComponentPropsMapping = keyof ComponentPropsMapping> {
  component: T;
  option: Option<ComponentPropsMapping[T]>;
  questionText?: string;
  showQuestionText?: boolean;
}

export const DynamicComponentRenderer = <T extends keyof ComponentPropsMapping>({ 
  component, 
  option, 
  questionText,
  showQuestionText = true 
}: DynamicComponentRendererProps<T>) => {
  const Component = componentMapping[component] as React.ComponentType<ComponentPropsMapping[T]>;
  
  if (!Component) return null;
  
  // Add null check for option
  if (!option || !option.optionProps) {
    return null;
  }

  return (
    <div className="question-component">
      {showQuestionText && questionText && <h3>{questionText}</h3>}
      <div className="option">
        <Component {...option.optionProps} />
      </div>
    </div>
  );
};