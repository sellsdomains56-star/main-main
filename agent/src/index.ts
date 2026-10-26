import { initAuth } from "./auth.js";
import { availableModels, config } from "./config.js";
import { startScheduler } from "./scheduler.js";
import { isUnlocked, vaultExists } from "./vault.js";
import { createApp } from "./server.js";

await await initAuth();
const app = createApp();
startScheduler();

app.listen(config.port, (err?: Error) => {
  if (err) {
    console.error(`\n  Couldn't start on port ${config.port}: ${err.message}\n  Is ${config.agentName} already running? Set PORT in .env to use another port.\n`);
    process.exit(1);
  }
  const models = availableModels().map((m) => m.label).join(", ");
  console.log(`\n  ${config.agentName} is running → http://localhost:${config.port}`);
  console.log(`  Models: ${models}`);
  console.log(`  Data:   ${config.dataDir} (encrypted at rest)`);
  if (!vaultExists()) console.log("  First run: open the app in your browser and choose your password.\n");
  else if (!isUnlocked()) console.log("  Locked: sign in from the browser to unlock your data.\n");
  else console.log("");
});
