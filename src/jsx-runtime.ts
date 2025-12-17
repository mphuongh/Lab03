export type Child = VNode | string | number | boolean | null | undefined;

export interface VNode {
  type: string | ComponentFunction;
  props: Record<string, any>;
  children: Child[];
}

export type ComponentFunction = (props: Record<string, any>) => any;

// ---------------- Root mounting ----------------
let rootVNode: VNode | null = null;
let rootContainer: HTMLElement | null = null;

// ---------------- Tiny hook state ----------------
let hookStates: any[] = [];
let hookIndex = 0;

export function useState<T>(initialValue: T): [() => T, (v: T) => void] {
  const idx = hookIndex;

  if (hookStates[idx] === undefined) {
    hookStates[idx] = initialValue;
  }

  const get = () => hookStates[idx] as T;
  const set = (v: T) => {
    hookStates[idx] = v;
    rerender();
  };

  hookIndex++;
  return [get, set];
}

// ---------------- JSX factory ----------------
export function createElement(
  type: string | ComponentFunction,
  props: Record<string, any> | null,
  ...children: any[]
): VNode {
  const safeProps = props ?? {};

  // flatten children + remove null/undefined/false
  const flat: Child[] = [];
  const push = (c: any) => {
    if (Array.isArray(c)) c.forEach(push);
    else if (c === null || c === undefined || c === false) return;
    else flat.push(c);
  };
  children.forEach(push);

  return { type, props: safeProps, children: flat };
}

export function createFragment(_: any, ...children: any[]): VNode {
  return createElement("fragment", null, ...children);
}

// ---------------- Render cycle ----------------
function rerender() {
  if (!rootVNode || !rootContainer) return;
  hookIndex = 0;
  rootContainer.innerHTML = "";
  rootContainer.appendChild(renderToDOM(rootVNode));
}

export function mount(vnode: VNode, container: HTMLElement) {
  rootVNode = vnode;
  rootContainer = container;
  rerender();
}

// ---------------- DOM helpers ----------------

// Store event handlers on the element so we can replace them safely on rerender
type HandlerMap = Record<string, EventListener>;
const EVENT_STORE = "__jsx_event_store__";

function isHTMLElement(n: any): n is HTMLElement {
  return n && typeof n === "object" && typeof n.tagName === "string";
}

function setStyle(el: HTMLElement, value: any) {
  if (value == null) return;

  if (typeof value === "string") {
    el.setAttribute("style", value);
    return;
  }

  if (typeof value === "object") {
    Object.assign(el.style, value);
  }
}

function setDOMProperty(el: any, key: string, value: any) {
  // These must be set as DOM properties to avoid "typing 1 char then reset"
  if (key === "value") {
    // for input/textarea/select
    el.value = value ?? "";
    return true;
  }
  if (key === "checked") {
    el.checked = Boolean(value);
    return true;
  }
  if (key === "selected") {
    el.selected = Boolean(value);
    return true;
  }
  return false;
}

function setEvent(el: HTMLElement, key: string, value: any) {
  if (!key.startsWith("on")) return false;

  const eventName = key.slice(2).toLowerCase();
  if (typeof value !== "function") return true; // ignore non-function

  const store: HandlerMap = (el as any)[EVENT_STORE] ?? ((el as any)[EVENT_STORE] = {});
  // remove old handler if exists
  if (store[eventName]) el.removeEventListener(eventName, store[eventName]);
  // add new
  const handler: EventListener = value;
  store[eventName] = handler;
  el.addEventListener(eventName, handler);
  return true;
}

function setProp(el: HTMLElement, key: string, value: any) {
  // className
  if (key === "className") {
    el.className = value ?? "";
    return;
  }

  // ref
  if (key === "ref" && typeof value === "function") {
    value(el);
    return;
  }

  // style
  if (key === "style") {
    setStyle(el, value);
    return;
  }

  // events
  if (setEvent(el, key, value)) return;

  // DOM properties that must be set as properties (value/checked/selected)
  if (setDOMProperty(el as any, key, value)) return;

  // boolean attributes
  if (typeof value === "boolean") {
    if (value) el.setAttribute(key, "");
    else el.removeAttribute(key);
    return;
  }

  // remove attrs when nullish
  if (value === null || value === undefined) {
    el.removeAttribute(key);
    return;
  }

  // normal attributes fallback
  el.setAttribute(key, String(value));
}

// ---------------- Render to DOM ----------------
export function renderToDOM(node: any): Node {
  // text nodes
  if (typeof node === "string" || typeof node === "number") {
    return document.createTextNode(String(node));
  }

  // ignore true (rare but safe)
  if (node === true || node === false || node === null || node === undefined) {
    return document.createTextNode("");
  }

  // fragment
  if (node.type === "fragment") {
    const frag = document.createDocumentFragment();
    node.children.forEach((c: any) => {
      const childNode = renderToDOM(c);
      frag.appendChild(childNode);
    });
    return frag;
  }

  // function component
  if (typeof node.type === "function") {
    const rendered = node.type({ ...(node.props ?? {}), children: node.children });
    return renderToDOM(rendered);
  }

  // html element
  const el = document.createElement(node.type);

  const props = node.props ?? {};
  Object.entries(props).forEach(([k, v]) => setProp(el, k, v));

  node.children.forEach((c: any) => {
    el.appendChild(renderToDOM(c));
  });

  return el;
}
