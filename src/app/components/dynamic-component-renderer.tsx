import { componentMapping, ComponentPropsMapping } from './interfaceMapping';

interface DynamicComponentRendererProps {
  component: keyof ComponentPropsMapping;
  option: { optionProps: any };
}

export const DynamicComponentRenderer: React.FC<DynamicComponentRendererProps> = ({ component, option }) => {
  const Component = componentMapping[component];
  if (!Component) return null;
  return <Component {...option.optionProps} />;
};