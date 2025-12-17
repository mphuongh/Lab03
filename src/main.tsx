/** @jsx createElement */
import { createElement, mount } from "./jsx-runtime";
import { Dashboard } from "./dashboard";
import "./styles.css";

mount(<Dashboard />, document.getElementById("root")!);
