'use client'
import Image from "next/image";
import { Button } from "./components/button/button";
import { Checkbox } from "./components/checkbox/checkbox";
import { RadioBar } from "./components/radios/radio-bar";
import { TextInput } from "./components/text-field/text-field";
import { useState } from "react";
import { Question } from "./app-modules/questions/question";

export default function Home() {
  const [text, setText] = useState("");

  const defaultProps = {
    questionText: "What is your favorite color?",
    component: "RadioBar",
    options: [
        { label: "Red", value: "red", activeLabel: "", inactiveLabel: "" },
        { label: "Blue", value: "blue", activeLabel: "Yes", inactiveLabel: "No" },
        { label: "Green", value: "green",  activeLabel: "", inactiveLabel: "" },
    ],
};1

  return (
    <>
      <a>Hello</a>
      <div>
        <Button label={"kek"} className="button-base"/>
        <Button label={"lol"} className="button-base right"/>
        <p>kek</p>
        <Checkbox activeLabel="ON" inactiveLabel="OFF"/>
        <RadioBar buttons={[{label: "kek", value: "kek"}, {label: "lol", value: "lol"}]} name="kek"/>
        <TextInput
        label="Your Name"
        placeholder="Enter your name"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <p>Typed Value: {text}</p>
      {/* <Question {...defaultProps} /> */}
      </div>
    </>
  );
}
