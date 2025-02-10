import React from "react";
import { Checkbox } from "./checkbox";
import { render, screen, fireEvent } from "@testing-library/react";


test("renders Checkbox component", () => {
  render(<Checkbox />);
  const checkboxElement = screen.getByRole("checkbox");
  expect(checkboxElement).toBeInTheDocument();
});
test("renders Checkbox component", () => {
  render(<Checkbox />);
  const checkboxElement = screen.getByRole("checkbox");
  expect(checkboxElement).toBeInTheDocument();
});

test("checkbox toggles between checked and unchecked", () => {
  render(<Checkbox />);
  const checkboxElement = screen.getByRole("checkbox");
  expect(checkboxElement).not.toBeChecked();
  fireEvent.click(checkboxElement);
  expect(checkboxElement).toBeChecked();
  fireEvent.click(checkboxElement);
  expect(checkboxElement).not.toBeChecked();
});

test("displays activeLabel when checked and inactiveLabel when unchecked", () => {
  const activeLabel = "Active";
  const inactiveLabel = "Inactive";
  render(<Checkbox activeLabel={activeLabel} inactiveLabel={inactiveLabel} />);
  const checkboxElement = screen.getByRole("checkbox");
  const labelElement = screen.getByText(inactiveLabel);
  expect(labelElement).toBeInTheDocument();
  fireEvent.click(checkboxElement);
  expect(screen.getByText(activeLabel)).toBeInTheDocument();
  fireEvent.click(checkboxElement);
  expect(screen.getByText(inactiveLabel)).toBeInTheDocument();
});

test("uses provided test_id for data-testid attribute", () => {
  const test_id = "custom-test-id";
  render(<Checkbox test_id={test_id} />);
  const checkboxElement = screen.getByTestId(test_id);
  expect(checkboxElement).toBeInTheDocument();
});
