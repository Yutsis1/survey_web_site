// import React from "react";
// import { render } from "@testing-library/react";
// import { Question, QuestionProps } from "./question";

// describe("Question Component", () => {
//     const renderComponent = (props: QuestionProps<any>) => render(<Question {...props} />);

//     it("should render question text", () => {
//         const props: QuestionProps<"TextInput"> = {
//             questionText: "What is your name?",
//             component: "TextInput",
//             options: [{ optionProps: { placeholder: "Enter your name" } }],
//         };

//         const { getByText } = renderComponent(props);
//         expect(getByText("What is your name?")).toBeInTheDocument();
//     });

//     it("should render TextInput component with correct props", () => {
//         const props: QuestionProps<"TextInput"> = {
//             questionText: "What is your name?",
//             component: "TextInput",
//             options: [{ optionProps: { placeholder: "Enter your name" } }],
//         };

//         const { getByPlaceholderText } = renderComponent(props);
//         expect(getByPlaceholderText("Enter your name")).toBeInTheDocument();
//     });

//     it("should render Checkbox component with correct props", () => {
//         const props: QuestionProps<"Checkbox"> = {
//             questionText: "Do you agree?",
//             component: "Checkbox",
//             options: [{ optionProps: { checked: true } }],
//         };

//         const { getByRole } = renderComponent(props);
//         expect(getByRole("checkbox")).toBeChecked();
//     });

//     it("should render RadioBar component with correct props", () => {
//         const props: QuestionProps<"RadioBar"> = {
//             questionText: "Choose an option",
//             component: "RadioBar",
//             options: [{ optionProps: { selected: true } }],
//         };

//         const { getByRole } = renderComponent(props);
//         expect(getByRole("radio")).toBeChecked();
//     });
// });