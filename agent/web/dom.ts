type Child = Node | string | number | false | null | undefined | Child[];
type Props = {
  class?: string;
  style?: string;
  html?: string;
  dataset?: Record<string, string>;
  [key: string]: unknown;
};

/** Small element builder: h("button", { class: "btn", onclick }, "Save"). */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props | null = null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === undefined || value === null || value === false) continue;
      if (key === "class") el.className = String(value);
      else if (key === "style") el.setAttribute("style", String(value));
      else if (key === "html") el.innerHTML = String(value); // only ever used with our own icon SVGs
      else if (key === "dataset") Object.assign(el.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value as EventListener);
      else if (value === true) el.setAttribute(key, "");
      else if (key in el && typeof value !== "string") (el as unknown as Record<string, unknown>)[key] = value;
      else el.setAttribute(key, String(value));
    }
  }
  append(el, children);
  return el;
}

export function append(el: Element, children: Child[]): void {
  for (const c of children.flat(Infinity as 1) as Child[]) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

export function clear(el: Element): void {
  while (el.firstChild) el.firstChild.remove();
}

export const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);

/**
 * Runs `handler` when a form is submitted. Besides the submit event, it listens
 * for the submit button and Enter, because embedded viewers (sandboxed frames)
 * often block form submission entirely. The browser's own field checks still run.
 */
export function onSubmit(form: HTMLFormElement, handler: () => unknown): void {
  let busy = false;
  const run = (e: Event) => {
    e.preventDefault();
    if (busy || !form.reportValidity()) return;
    busy = true;
    void Promise.resolve(handler()).finally(() => (busy = false));
  };
  form.addEventListener("submit", run);
  form.addEventListener("click", (e) => {
    const button = (e.target as HTMLElement).closest("button");
    if (button && button.type === "submit" && form.contains(button)) run(e);
  });
  form.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && !e.isComposing && target.tagName === "INPUT" && (target as HTMLInputElement).type !== "checkbox") run(e);
  });
}
