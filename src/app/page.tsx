"use client";
import { useState } from "react";
import { Question } from "./app-modules/questions/question";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Home() {
  const [text, setText] = useState("");

  const layout = [
    { i: "question", x: 0, y: 0, w: 2, h: 2 },
  ];

  return (
    <>  
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
        >
          <div key="question">
            <Question
              questionText="KEK"
              component="Checkbox"
              options={[
                { optionProps: { activeLabel: "ON", inactiveLabel: "OFF" } },
              ]}
            />
          </div>
        </ResponsiveGridLayout>
    </>
  );
}
