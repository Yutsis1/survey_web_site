import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { TextInput } from "./text-field";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

describe("TextInput Component", () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        vi.clearAllMocks()
        vi.resetModules()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })
    it("renders without crashing", () => {
        const { getByPlaceholderText } = render(
            <TextInput onChange={() => {}} />
        );
        expect(getByPlaceholderText("Enter text...")).toBeInTheDocument();
    });

    it("renders with a label", () => {
        const { getByText } = render(
            <TextInput label="Test Label" onChange={() => {}} />
        );
        expect(getByText("Test Label")).toBeInTheDocument();
    });

    it("renders with a placeholder", () => {
        const { getByPlaceholderText } = render(
            <TextInput placeholder="Custom Placeholder" onChange={() => {}} />
        );
        expect(getByPlaceholderText("Custom Placeholder")).toBeInTheDocument();
    });

    it("renders with a value", () => {
        const { getByDisplayValue } = render(
            <TextInput value="Test Value" onChange={() => {}} />
        );
        expect(getByDisplayValue("Test Value")).toBeInTheDocument();
    });

    it("calls onChange when input value changes", () => {
        const handleChange = vi.fn();
        const { getByPlaceholderText } = render(
            <TextInput onChange={handleChange} />
        );
        const input = getByPlaceholderText("Enter text...");
        fireEvent.change(input, { target: { value: "New Value" } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("applies custom className", () => {
        const { container } = render(
            <TextInput className="custom-class" onChange={() => {}} />
        );
        expect(container.firstChild).toHaveClass("custom-class");
    });

    it("renders with the correct type", () => {
        const { getByPlaceholderText } = render(
            <TextInput type="password" onChange={() => {}} />
        );
        expect(getByPlaceholderText("Enter text...")).toHaveAttribute("type", "password");
    });

    it("renders with test_id", () => {
        const { getByTestId } = render(
            <TextInput test_id="test-id" onChange={() => {}} />
        );
        expect(getByTestId("test-id")).toBeInTheDocument();
    });

    it("does not render password toggle by default", () => {
        const { queryByRole } = render(
            <TextInput type="password" onChange={() => {}} />
        );
        expect(queryByRole("button", { name: "Show password" })).not.toBeInTheDocument();
    });

    it("renders password toggle when enabled for password fields", () => {
        const { getByRole } = render(
            <TextInput type="password" showPasswordToggle onChange={() => {}} />
        );
        expect(getByRole("button", { name: "Show password" })).toBeInTheDocument();
    });

    it("toggles password visibility when the toggle button is clicked", () => {
        const { getByPlaceholderText, getByRole } = render(
            <TextInput type="password" showPasswordToggle onChange={() => {}} />
        );

        const input = getByPlaceholderText("Enter text...");
        const toggleButton = getByRole("button", { name: "Show password" });

        expect(input).toHaveAttribute("type", "password");

        fireEvent.click(toggleButton);
        expect(input).toHaveAttribute("type", "text");

        fireEvent.click(toggleButton);
        expect(input).toHaveAttribute("type", "password");
    });

    it("renders toggle as a non-submit button with accessible labels", () => {
        const { getByRole } = render(
            <TextInput type="password" showPasswordToggle onChange={() => {}} />
        );

        const toggleButton = getByRole("button", { name: "Show password" });
        expect(toggleButton).toHaveAttribute("type", "button");
        expect(toggleButton).toHaveAttribute("aria-pressed", "false");

        fireEvent.click(toggleButton);

        expect(toggleButton).toHaveAttribute("aria-label", "Hide password");
        expect(toggleButton).toHaveAttribute("aria-pressed", "true");
    });
});
