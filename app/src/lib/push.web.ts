// The website shows alerts in the app's inbox and as an in-page banner (components/AlertBanner).
export type PushState = "on" | "off" | "ask" | "unsupported";
export const pushState = async (): Promise<PushState> => "unsupported";
export const enablePush = async (_ask: boolean): Promise<PushState> => "unsupported";
export const disablePush = async () => {};
export const usePushNavigation = () => {};
