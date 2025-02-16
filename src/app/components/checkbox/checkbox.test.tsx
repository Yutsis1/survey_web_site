import React from "react";
import { Checkbox } from "./checkbox";
import { render, screen, fireEvent } from "@testing-library/react";



describe("Checkbox component", () => {
  test("renders with initial state unchecked", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  test("renders with initial state checked", () => {
    render(<Checkbox initialState={true} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  test("toggles state on click", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByText("Active")).toBeInTheDocument();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });
});
