import { h } from "./dom.js";
import { icon } from "./icons.js";

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDateTime(ms: number, timeZone?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ms);
}

export function relativeDay(ms: number): string {
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((day(new Date()) - day(new Date(ms))) / 86_400_000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return "Previous 7 days";
  if (diff < 30) return "Previous 30 days";
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(ms);
}

export function greeting(name: string): string {
  const hour = new Date().getHours();
  const part = hour < 5 ? "Up late" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${part}, ${name}` : part;
}

let toastHost: HTMLElement | null = null;
export function toast(message: string, kind: "info" | "error" | "success" = "info", onClick?: () => void): void {
  // A popover sits in the top layer, so toasts show above open dialogs too.
  toastHost ??= document.body.appendChild(h("div", { class: "toasts", role: "status", "aria-live": "polite", popover: "manual" }));
  if (toastHost.matches(":popover-open")) toastHost.hidePopover();
  toastHost.showPopover();
  const el = h(
    "div",
    { class: `toast toast-${kind}${onClick ? " clickable" : ""}`, onclick: onClick },
    h("span", { class: "toast-icon", html: icon(kind === "error" ? "alert" : kind === "success" ? "check" : "bell", 16) }),
    h("span", null, message),
  );
  toastHost.append(el);
  setTimeout(() => el.classList.add("leaving"), 4200);
  setTimeout(() => el.remove(), 4600);
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/** Shrinks big photos before upload (keeps the original if it's already small). */
export async function prepareImage(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 3_000_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export function confirmDialog(message: string, confirmLabel = "Delete"): Promise<boolean> {
  return new Promise((resolve) => {
    const dialog = h(
      "dialog",
      { class: "modal confirm" },
      h("p", null, message),
      h(
        "div",
        { class: "modal-actions" },
        h("button", { class: "btn ghost", onclick: () => close(false) }, "Cancel"),
        h("button", { class: "btn danger", onclick: () => close(true) }, confirmLabel),
      ),
    );
    const close = (value: boolean) => {
      dialog.close();
      dialog.remove();
      resolve(value);
    };
    dialog.addEventListener("cancel", () => close(false));
    document.body.append(dialog);
    dialog.showModal();
  });
}
