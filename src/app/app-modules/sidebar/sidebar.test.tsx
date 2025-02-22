import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Sidebar, SidebarProps } from "./sidebar";


describe.skip("Sidebar component", () => {
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

    test("renders buttons correctly", () => {
        render(<Sidebar buttons={buttonProps} />);
        buttonProps.forEach((button) => {
            expect(screen.getByText(button.label)).toBeInTheDocument();
        });
    });

    test("calls onClick handler when button is clicked", () => {
        const buttons = [
            {
                label: "Button 1",
                onClick: jest.fn(),
                className: "button-base",
                test_id: "button-1",
            },
            {
                label: "Button 2",
                onClick: jest.fn(),
                className: "button-base",
                test_id: "button-2",
            },
        ];

        render(<Sidebar buttons={buttons} />);

        buttons.forEach((button) => {
            if (button.test_id) {
                const buttonElement = screen.getByTestId(button.test_id);
                fireEvent.click(buttonElement);
                expect(button.onClick).toHaveBeenCalled();
            }
        });
    });
});