/** @jsx createElement */
import { createElement, useState } from "./jsx-runtime";

export const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="card">
      <h3>Counter</h3>
      <div className="counter">
        <button onClick={() => setCount(count() - 1)}>-</button>
        <span>{count()}</span>
        <button onClick={() => setCount(count() + 1)}>+</button>
      </div>
    </div>
  );
};
