import type { Provider } from "../../config.js";
import { anthropicProvider } from "./anthropic.js";
import { mockProvider } from "./mock.js";
import type { ProviderAdapter } from "./types.js";
import { xaiProvider } from "./xai.js";

export function providerFor(provider: Provider): ProviderAdapter {
  switch (provider) {
    case "anthropic":
      return anthropicProvider;
    case "xai":
      return xaiProvider;
    default:
      return mockProvider;
  }
}
