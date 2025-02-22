import { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
// Todo:
// update the component between sidebar and right panel

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface GridElementProps {
  domElements: any[];
  className?: string;
  rowHeight?: number;
  onLayoutChange?: (layout: any, layouts: any) => void;
  cols?: any;
  
  breakpoints?: any;
  containerPadding?: number[];
}

const layout = [{ i: "question", x: 0, y: 0, w: 2, h: 2 }];

const GridElement = (props: GridElementProps) => {
  const [isDragging, setIsDragging] = useState(false); // Track drag state

  return (
    <>
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        isDraggable={true}
        onDragStart={() => setIsDragging(true)} // Detect drag start
        onDragStop={() => setIsDragging(false)} // Detect drag stop
      ></ResponsiveGridLayout>
    </>
  );
};
