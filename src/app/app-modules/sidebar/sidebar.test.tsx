import { render, screen } from "@testing-library/react";
import { Sidebar } from "./sidebar";

describe("Sidebar component", () => {
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
});