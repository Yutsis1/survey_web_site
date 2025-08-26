import React from "react";
import { Checkbox } from "./checkbox";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

  describe("Checkbox component", () => {

        beforeEach(() => {
            document.body.innerHTML = ''
            vi.clearAllMocks()
            vi.resetModules()
        })
    
        afterEach(() => {
            vi.resetAllMocks()
        })
      test("defaults to unchecked when no checked prop is provided", () => {
        render(<Checkbox onChange={() => {}} />);
        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).not.toBeChecked();
        expect(screen.getByText("Inactive")).toBeInTheDocument();
      });

      test("renders with initial state unchecked", () => {
        render(<Checkbox checked={false} onChange={() => {}} />);
        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).not.toBeChecked();
        expect(screen.getByText("Inactive")).toBeInTheDocument();
      });

      test("renders with initial state checked", () => {
        render(<Checkbox checked={true} onChange={() => {}} />);
        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).toBeChecked();
        expect(screen.getByText("Active")).toBeInTheDocument();
      });

      test("toggles state on click", () => {
        const handleChange = vi.fn();
        render(<Checkbox checked={false} onChange={handleChange} />);
        const checkbox = screen.getByRole("checkbox");
        fireEvent.click(checkbox);
        expect(handleChange).toHaveBeenCalledWith(true);
        fireEvent.click(checkbox);
        expect(handleChange).toHaveBeenCalledWith(false);
      });

      test("displays custom labels", () => {
        render(
          <Checkbox
            checked={true}
            onChange={() => {}}
            activeLabel="On"
            inactiveLabel="Off"
          />
        );
        expect(screen.getByText("On")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("checkbox"));
        expect(screen.getByText("Off")).toBeInTheDocument();
      });

      test("updates state when props change", () => {
        const { rerender } = render(<Checkbox checked={false} onChange={() => {}} />);
        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).not.toBeChecked();

        rerender(<Checkbox checked={true} onChange={() => {}} />);
        expect(checkbox).toBeChecked();
      });
    });


