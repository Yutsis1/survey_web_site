import Image from "next/image";
import { Button } from "./components/button/button";

export default function Home() {
  return (
    <>
      <a>Hello</a>
      <div>
        <Button label={"kek"} className="button-base"/>
        <Button label={"lol"} className="button-base right"/>
      </div>
    </>
  );
}
