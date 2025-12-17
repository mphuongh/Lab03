/** @jsx createElement */
import { createElement, useState } from "./jsx-runtime";

export const Todo = () => {
  const [text, setText] = useState("");
  const [list, setList] = useState<string[]>([]);

  return (
    <div className="card">
      <h3>Todo List</h3>
      <input value={text()} onInput={(e:any)=>setText(e.target.value)} />
      <button onClick={() => {
        setList([...list(), text()]);
        setText("");
      }}>Add</button>

      <ul>
        {list().map((t, i) => (
          <li>
            {t}
            <button onClick={() =>
              setList(list().filter((_, idx) => idx !== i))
            }>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
