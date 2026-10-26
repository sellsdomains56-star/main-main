import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { config } from "../config.js";
import { WORKSPACE_DIR } from "../files.js";

export type Language = "python" | "javascript" | "bash";

export interface CodeResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  durationMs: number;
}

const MAX_OUTPUT = 20_000;

function clip(text: string): string {
  if (text.length <= MAX_OUTPUT) return text;
  const half = MAX_OUTPUT / 2;
  return `${text.slice(0, half)}\n… [${text.length - MAX_OUTPUT} characters cut] …\n${text.slice(-half)}`;
}

const RUNNERS: Record<Language, { cmd: string; ext: string }> = {
  python: { cmd: "python3", ext: "py" },
  javascript: { cmd: process.execPath, ext: "mjs" },
  bash: { cmd: "bash", ext: "sh" },
};

/**
 * Runs code in the workspace folder. The child gets a minimal environment, so
 * API keys and the app password never reach code the model writes.
 */
export function runCode(language: Language, code: string, timeoutSeconds: number, signal?: AbortSignal): Promise<CodeResult> {
  const runner = RUNNERS[language];
  const scriptDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-run-"));
  const script = path.join(scriptDir, `main.${runner.ext}`);
  fs.writeFileSync(script, code);
  const started = Date.now();

  return new Promise((resolve) => {
    const child = spawn(runner.cmd, [script], {
      cwd: WORKSPACE_DIR,
      detached: true,
      env: {
        PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin",
        HOME: WORKSPACE_DIR,
        LANG: "C.UTF-8",
        TZ: config.timezone,
        MPLBACKEND: "Agg",
        PYTHONUNBUFFERED: "1",
        PYTHONDONTWRITEBYTECODE: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    child.stdout.on("data", (chunk: Buffer) => {
      if (stdout.length < MAX_OUTPUT * 4) stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      if (stderr.length < MAX_OUTPUT * 4) stderr += chunk.toString();
    });

    const kill = () => {
      try {
        if (child.pid) process.kill(-child.pid, "SIGKILL");
      } catch {
        child.kill("SIGKILL");
      }
    };
    const timer = setTimeout(() => {
      timedOut = true;
      kill();
    }, timeoutSeconds * 1000);
    signal?.addEventListener("abort", kill, { once: true });

    let finished = false;
    const finish = (exitCode: number | null) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", kill);
      fs.rmSync(scriptDir, { recursive: true, force: true });
      resolve({ exitCode, stdout: clip(stdout), stderr: clip(stderr), timedOut, durationMs: Date.now() - started });
    };
    child.on("error", (err) => {
      stderr += `${runner.cmd}: ${err.message}`;
      finish(null);
    });
    child.on("close", (code) => finish(code));
  });
}
