import Image from "next/image";
import { Button } from "./components/button/button";
import { Checkbox } from "./components/checkbox/checkbox";
import { Radio } from "./components/radios/radio-component";

export default function Home() {
  return (
    <>
      <a>Hello</a>
      <div>
        <Button label={"kek"} className="button-base"/>
        <Button label={"lol"} className="button-base right"/>
        <p>kek</p>
        <Checkbox activeLabel="ON" inactiveLabel="OFF" className="checkbox-wrapper"/>
        <Radio label={"lol"} className="radio-wrapper"/>
      </div>
    </>
  );
}
