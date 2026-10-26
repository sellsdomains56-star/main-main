type Downloads = { save(file: { filename: string; data: string }): Promise<unknown> };
type PageRuntime = { use?(name: "downloads"): Promise<Downloads | null> };

/**
 * Website: saves a text file the page made (a CSV, a calendar file). Inside the private demo
 * page viewer, links can't download, so the viewer's own save prompt is used instead.
 * Resolves false when the person declines that prompt.
 */
export async function saveFile(filename: string, data: string, type: string): Promise<boolean> {
  const runtime = (globalThis as { claude?: PageRuntime }).claude;
  const downloads = runtime?.use ? await runtime.use("downloads").catch(() => null) : null;
  if (downloads) {
    try {
      await downloads.save({ filename, data });
      return true;
    } catch (e) {
      if ((e as { code?: string }).code === "declined") return false;
      throw new Error("This file can't be saved here.");
    }
  }
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return true;
}
