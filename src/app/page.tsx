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
  const [isPopUpOpen, setIsPopUpOpen] = useState(false); // Add popup state


    const handlePopUpApply = () => {
    // Add your apply logic here
    console.log("Apply clicked");
    setIsPopUpOpen(false); // Close popup after applying
  };

  const handlePopUpClose = () => {
    setIsPopUpOpen(false);
  };

  const buttonProps = [
    {
      label: "New Question",
      onClick: () => {
        console.log("New Question clicked");
        setIsPopUpOpen(true); 
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
      {/* Add the PopUp component */}
      <PopUp
        isOpen={isPopUpOpen}
        onClose={handlePopUpClose}
        onApply={handlePopUpApply}
        popUpTitle="Create New Question"
        popUpDescription="Configure your new question settings below"
        // Add components and options if needed
        // components={["Checkbox"]}
        // options={[{ optionProps: { /* your option props */ } }]}
      />
    </div>
  );
}
