import { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import {
  Question,
  QuestionProps,
  ComponentPropsMapping,
} from "../questions/question";
// Todo:
// update the component between sidebar and right panel

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

const layout = [{ i: "question", x: 0, y: 0, w: 2, h: 2 }];

const GridElement = (props: GridElementProps) => {
  const [isDragging, setIsDragging] = useState(false); // Track drag state

  return (
    <>
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: props.layout ?? layout }}
        breakpoints={props.breakpoints ?? { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={props.cols ?? { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        isDraggable={true}
        onDragStart={() => setIsDragging(true)} // Detect drag start
        onDragStop={() => setIsDragging(false)} // Detect drag stop
      >
        <div key="question">
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
