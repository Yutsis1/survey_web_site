import { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";

import "./grid-element.css";
import { Question, QuestionProps } from "../questions/question";
import { ComponentPropsMapping } from "../interfaceMapping";

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface GridElementProps {
  className?: string;
  rowHeight?: number;
  onLayoutChange?: (layout: any, layouts: any) => void;
  cols?: any;
  layout?: any;
  breakpoints?: any;
  containerPadding?: number[];
  questionProps?: QuestionProps<keyof ComponentPropsMapping>;
}

const layout = [{ i: "question", x: 0, y: 0, w: 1, h: 2 }];

const GridElement = (props: GridElementProps) => {
  const [isDragging, setIsDragging] = useState(false); // Track drag state

  return (
    <>
      <ResponsiveGridLayout
        className="layout" // Add a class name
        layouts={{ lg: props.layout ?? layout }}
        breakpoints={
          props.breakpoints ?? { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
        }
        cols={props.cols ?? { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        containerPadding={[15, 15]} // Add some padding
        margin={[10, 10]} // Add margin between items
        isDraggable={true}
        onDragStart={() => setIsDragging(true)}
        onDragStop={() => setIsDragging(false)}
      >
        <div key="question" className="grid-item">
          <Question
            {...(props.questionProps as QuestionProps<
              keyof ComponentPropsMapping
            >)}
          />
        </div>
      </ResponsiveGridLayout>
    </>
  );
};

export { GridElement };
