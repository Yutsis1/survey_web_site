import React from "react";
import { Button, ButtonProps } from "@/app/components/button/button";
import "./sidebar.css";

export interface SidebarProps {
  buttons: ButtonProps[];
}

const Sidebar: React.FC<SidebarProps> = ({ buttons }) => {
  return (
    <aside className="sidebar">
      <div>
        {buttons.map((button, index) => (
          <div key={index} style={{ margin: "10px", padding: "5px" }}>
            <Button
              label={button.label}
              onClick={button.onClick}
              className={button.className}
              test_id={button.test_id}
            />
          </div>
        ))}
      </div>
    </aside>
  );
};

export { Sidebar };
