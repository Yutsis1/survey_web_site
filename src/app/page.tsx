"use client";
import { useState } from "react";
import { GridElement } from "./app-modules/grid-element/grid-element";
// import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./styles.css"; // Import your styles
import { Sidebar } from "./app-modules/sidebar/sidebar";
import { PopUp } from "./app-modules/pop-up/pop-up";

export default function Home() {
  const [isChecked, setIsChecked] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Track drag state

  const buttonProps = [
    {
      label: "New Question",
      onClick: () => {
        console.log("New Question clicked");
// TODO: Implement the logic to open the pop-up
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
    <div className="app-container">
      <aside className="sidebar">
        <Sidebar buttons={buttonProps}></Sidebar>
      </aside>
      <main className="content">
        <div className="grid-container">
          <GridElement
            questionProps={{
              questionText: "KEK",
              component: "Checkbox",
              option: 
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
              
            }}
          />
        </div>
      </main>
    </div>
  );
}
