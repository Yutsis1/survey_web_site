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

  return (
    <>
      <a>Hello</a>
      <div>
        <Button label={"kek"} className="button-base"/>
        <Button label={"lol"} className="button-base right"/>
        <p>kek</p>
        <Checkbox activeLabel="ON" inactiveLabel="OFF" className="checkbox-wrapper"/>
        {/* <RadioBar buttons={[{label: "kek", value: "kek"}, {label: "lol", value: "lol"}]} name="kek"/> */}
        <TextInput
        label="Your Name"
        placeholder="Enter your name"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <p>Typed Value: {text}</p>
      <div> <Question questionText={"ababab"} options={[{label: "kek", value: "0", component: "Checkbox"}]} onOptionChange={function (index: number, value: string): void {
          throw new Error("Function not implemented.");
        } }/> </div>
      </div>
    </>
  );
}
