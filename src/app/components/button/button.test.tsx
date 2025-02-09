import React from "react";
import { Button } from "./button";
import { render, screen } from "@testing-library/react";

describe("Button component", () => {
    test("renders button with label", () => {
        render(<Button label="Click me" />);
        const buttonElement = screen.getByText(/Click me/i);
        expect(buttonElement).toBeInTheDocument();
    });

    test("applies className prop", () => {
        render(<Button label="Click me" className="custom-class" />);
        const buttonElement = screen.getByText(/Click me/i);
        expect(buttonElement).toHaveClass("custom-class");
    });

    test("applies test_id prop", () => {
        render(<Button label="Click me" test_id="button-1" />);
        const buttonElement = screen.getByTestId("button-1");
        expect(buttonElement).toBeInTheDocument();
    });
});


