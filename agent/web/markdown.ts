import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";
import { Marked, type Tokens } from "marked";
import { icon } from "./icons.js";

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    code({ text, lang }: Tokens.Code) {
      const language = (lang ?? "").trim().split(/\s+/)[0].toLowerCase();
      let body: string;
      if (language && hljs.getLanguage(language)) body = hljs.highlight(text, { language, ignoreIllegals: true }).value;
      else body = escape(text);
      return (
        `<div class="codeblock"><div class="codeblock-head"><span>${escape(language || "text")}</span>` +
        `<button class="copy-code" type="button" title="Copy code">${icon("copy", 14)}<span>Copy</span></button></div>` +
        `<pre><code class="hljs">${body}</code></pre></div>`
      );
    },
    table(token: Tokens.Table) {
      // Wide tables scroll sideways instead of breaking the layout.
      const head = token.header.map((c) => `<th${c.align ? ` style="text-align:${c.align}"` : ""}>${this.parser.parseInline(c.tokens)}</th>`).join("");
      const rows = token.rows
        .map((r) => `<tr>${r.map((c) => `<td${c.align ? ` style="text-align:${c.align}"` : ""}>${this.parser.parseInline(c.tokens)}</td>`).join("")}</tr>`)
        .join("");
      return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
    },
  },
});

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

/** Model output → safe HTML. */
export function renderMarkdown(text: string): string {
  // Close an unfinished code fence while streaming so the rest doesn't render as code-less soup.
  const fences = (text.match(/^```/gm) ?? []).length;
  const source = fences % 2 === 1 ? `${text}\n\`\`\`` : text;
  const html = marked.parse(source, { async: false }) as string;
  return DOMPurify.sanitize(html, { ADD_ATTR: ["target"], FORBID_TAGS: ["style", "form", "input", "iframe"] });
}

document.addEventListener("click", (e) => {
  const button = (e.target as HTMLElement).closest<HTMLButtonElement>(".copy-code");
  if (!button) return;
  const code = button.closest(".codeblock")?.querySelector("code")?.textContent ?? "";
  void navigator.clipboard.writeText(code).then(() => {
    button.classList.add("copied");
    button.querySelector("span")!.textContent = "Copied";
    setTimeout(() => {
      button.classList.remove("copied");
      button.querySelector("span")!.textContent = "Copy";
    }, 1500);
  });
});
