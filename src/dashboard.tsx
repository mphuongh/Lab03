/** @jsx createElement */
import { createElement, useState } from "./jsx-runtime";
import { generateData } from "./data";
import { Chart } from "./chart";
import { Counter } from "./counter";
import { Todo } from "./todo";

export const Dashboard = () => {
  const [data, setData] = useState(generateData());
  const [cat, setCat] = useState<"All"|"A"|"B"|"C">("All");

  const filtered = cat()==="All"
    ? data()
    : data().filter(d=>d.category===cat());

  return (
    <div className="app">
      <h1>Analytics Dashboard</h1>

      <div className="toolbar">
        {["All","A","B","C"].map(c =>
          <button onClick={()=>setCat(c as any)}>{c}</button>
        )}
        <button onClick={()=>setData(generateData())}>Refresh</button>
      </div>

      <Chart data={filtered} />

      <div className="grid">
        <Counter />
        <Todo />
      </div>
    </div>
  );
};
