"use client";
import { useState } from "react";
import { GridElement } from "./app-modules/grid-element/grid-element";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Sidebar } from "./app-modules/sidebar/sidebar";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Home() {
  const [isChecked, setIsChecked] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Track drag state

  const buttonProps = [
    {
      label: "Button 1",
      onClick: () => {
        console.log("Button 1 clicked");
      },
      className: "button-base",
      test_id: "button-1",
    },
    {
      label: "Button 2",
      onClick: () => {
        console.log("Button 2 clicked");
      },
      className: "button-base",
      test_id: "button-2",
    },
  ];

  return (
    <>
      <Sidebar buttons={buttonProps}></Sidebar>
      <main>
        <GridElement
          questionProps={{
            questionText: "KEK",
            component: "Checkbox",
            options: [
              {
                optionProps: {
                  activeLabel: "ON",
                  inactiveLabel: "OFF",
                  checked: isChecked,
                  onChange: (
                    checked: boolean | ((prevState: boolean) => boolean)
                  ) => {
                    if (!isDragging) {
                      setIsChecked(checked);
                    }
                  },
                },
              },
            ],
          }}
        />
      </main>
    </>
  );
}
