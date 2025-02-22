"use client";
import { useState } from "react";
import { Question } from "./app-modules/questions/question";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Sidebar } from "./app-modules/sidebar/sidebar";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Home() {
  const [isChecked, setIsChecked] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Track drag state

  const layout = [{ i: "question", x: 0, y: 0, w: 2, h: 2 }];

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
      <div className="container">
        <div className="sidebar-container">
          <Sidebar buttons={buttonProps}></Sidebar>
        </div>
        {/* <div className="grid-container">
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            isDraggable={true}
            onDragStart={() => setIsDragging(true)} // Detect drag start
            onDragStop={() => setIsDragging(false)} // Detect drag stop
          >
            <div key="question">
              <Question
                questionText="KEK"
                component="Checkbox"
                options={[
                  {
                    optionProps: {
                      activeLabel: "ON",
                      inactiveLabel: "OFF",
                      checked: isChecked,
                      onChange: (checked: boolean | ((prevState: boolean) => boolean)) => {
                        if (!isDragging) {
                          setIsChecked(checked);
                        }
                      },
                    },
                  },
                ]}
              />
            </div>
          </ResponsiveGridLayout>
        </div> */}
      </div>
    </>
  );
}
