import React from "react";
import { render } from "@testing-library/react";
import { Question, QuestionProps } from "./question";

describe("Question Component", () => {
    describe("Checkbox", () => {
        const props: QuestionProps<"Checkbox"> = {
            questionText: "KEK",
            component: "Checkbox",
            options: [
                { optionProps: {
                    activeLabel: "ON", inactiveLabel: "OFF",
                    checked: false,
                    onChange: function (checked: boolean): void {
                        props.options[0].optionProps.checked = checked;
                    }
                } },
            ],
        };

        it("renders the question text", () => {
            const { getByText } = render(<Question {...props} />);
            expect(getByText(props.questionText)).toBeInTheDocument();
        });

        it("renders the checkbox component", () => {
            const component = render(<Question {...props} />);
            expect(component.getByText("OFF")).toBeInTheDocument();
            component.getByText("OFF").click();
            expect(component.getByText("ON")).toBeInTheDocument();
        });
    });
    describe("RadioBar", () => {
        const props: QuestionProps<"RadioBar"> = {
            questionText: "KEK",
            component: "RadioBar",
            options: [
                {
                    optionProps: {
                        buttons: [
                            { label: "kek", value: "kek" },
                            { label: "lol", value: "lol" },
                        ],
                        name: "kek",
                    },
                },
            ],
        };

        it("renders the question text", () => {
            const { getByText } = render(<Question {...props} />);
            expect(getByText(props.questionText)).toBeInTheDocument();
        });

        it("renders the radio bar component", () => {
            const component = render(<Question {...props} />);
            expect(component.getByText("kek")).toBeInTheDocument();
            component.getByText("lol").click();
            expect(component.getByText("lol")).toBeInTheDocument();
        });
    });
    describe("TextInput", () => {
        const props: QuestionProps<"TextInput"> = {
            questionText: "KEK",
            component: "TextInput",
            options: [
                {
                    optionProps: {
                        label: "Your Name",
                        placeholder: "Enter your name",
                        value: "test",
                        onChange: jest.fn(),
                    },
                },
            ],
        };

        it("renders the question text", () => {
            const { getByText } = render(<Question {...props} />);
            expect(getByText(props.questionText)).toBeInTheDocument();
        });

        it("renders the text input component", () => {
            const component = render(<Question {...props} />);
            expect(component.getByDisplayValue("test")).toBeInTheDocument();
        });
    });
});

function setIsChecked(_checked: boolean) {
    throw new Error("Function not implemented.");
}

