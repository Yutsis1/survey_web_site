import React from "react";
import { Question } from "./question";
import { render, screen, fireEvent } from "@testing-library/react";

// skipping: need to rewright the test
describe.skip("Question Component", () => {
  const mockOnOptionChange = jest.fn();
  const options = [
    {
      label: "Option 1",
      value: "1",
      component: "TextInput",
      activeLabel: "",
      inactiveLabel: "",
    },
    {
      label: "Option 2",
      value: "2",
      component: "Checkbox",
      activeLabel: "Active",
      inactiveLabel: "Inactive",
    },
    {
      label: "Option 3",
      value: "3",
      component: "RadioBar",
      activeLabel: "",
      inactiveLabel: "",
    },
  ];

  it("renders question text", () => {
    render(
      <Question
        questionText="Sample Question?"
        options={options}
        onOptionChange={mockOnOptionChange}
      />
    );
    expect(screen.getByText("Sample Question?")).toBeInTheDocument();
  });

  it("renders all options", () => {
    render(
      <Question
        questionText="Sample Question?"
        options={options}
        onOptionChange={mockOnOptionChange}
      />
    );
    options.forEach((option) => {
      expect(screen.getByLabelText(option.label)).toBeInTheDocument();
    });
  });

  it("calls onOptionChange when an option value changes", () => {
    render(
      <Question
        questionText="Sample Question?"
        options={options}
        onOptionChange={mockOnOptionChange}
      />
    );

    const textInput = screen.getByLabelText("Option 1");
    fireEvent.change(textInput, { target: { value: "new value" } });
    expect(mockOnOptionChange).toHaveBeenCalledWith(0, "new value");

    const checkbox = screen.getByLabelText("Option 2");
    fireEvent.click(checkbox);
    expect(mockOnOptionChange).toHaveBeenCalledWith(1, "2");

    const radioBar = screen.getByLabelText("Option 3");
    fireEvent.click(radioBar);
    expect(mockOnOptionChange).toHaveBeenCalledWith(2, "3");
  });
});
