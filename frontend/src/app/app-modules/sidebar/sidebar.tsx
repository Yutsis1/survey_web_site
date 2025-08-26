import React from "react";
import { Button, ButtonProps } from "@/app/components/button/button";
import "./sidebar.css";

export interface SidebarProps {
  buttons: ButtonProps[];
}

const Sidebar: React.FC<SidebarProps> = ({ buttons }) => {
  return (
    <>
      <ul>
        {buttons.map((button, index) => (
          <li key={index} className="sidebar-button-item">
            <Button
              label={button.label}
              onClick={button.onClick}
              className={button.className}
              test_id={button.test_id || undefined}
              disabled={button.disabled}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

export { Sidebar };
