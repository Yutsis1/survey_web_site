import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout, Layouts } from "react-grid-layout";
import "./responsive-grid-layout.css";


const ResponsiveGridLayoutComponent = WidthProvider(Responsive);

export interface ResponsiveGridLayoutProps {
  className?: string;
  rowHeight?: number;
  onLayoutChange?: (layout: Layout[], layouts: Layouts) => void;
  cols?: Record<string, number>;
  layouts?: Layouts;
  breakpoints?: Record<string, number>;
  containerPadding?: [number, number];
  margin?: [number, number];
  isDraggable?: boolean;
  isResizable?: boolean;
  compactType?: "vertical" | "horizontal" | null;
  preventCollision?: boolean;
  children?: React.ReactNode;
  draggableCancel?: string;
  draggableHandle?: string;
}

const ResponsiveGridLayout = (props: ResponsiveGridLayoutProps) => {
  const [, setIsDragging] = useState(false);

  return (
    <ResponsiveGridLayoutComponent
      className={props.className || "layout"}
      layouts={props.layouts}
      breakpoints={
        props.breakpoints ?? { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
      }
      cols={props.cols ?? { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={props.rowHeight || 30}
      containerPadding={props.containerPadding || [15, 15]}
      margin={props.margin || [10, 10]}
      isDraggable={props.isDraggable !== undefined ? props.isDraggable : true}
      isResizable={props.isResizable !== undefined ? props.isResizable : true}
      onDragStart={() => setIsDragging(true)}
      onDragStop={() => setIsDragging(false)}
      compactType={props.compactType ?? null}
      preventCollision={props.preventCollision ?? false}
      onLayoutChange={props.onLayoutChange}
      draggableCancel={props.draggableCancel}
      draggableHandle={props.draggableHandle}
    >
      {props.children}
    </ResponsiveGridLayoutComponent>
  );
};

export { ResponsiveGridLayout };