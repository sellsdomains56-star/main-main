import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, setShopBranch } from "./api";
import { storage } from "./storage";
import type { ShopPanel, ShopRole } from "./types";

const BRANCH_KEY = "af_shop_branch";
const RANK: Record<ShopRole, number> = { front_desk: 0, manager: 1, owner: 2 };

interface PanelState {
  panel: ShopPanel | null;
  reload: () => void;
  switchBranch: (id: string) => Promise<void>;
  can: (need: ShopRole) => boolean;
}

const Ctx = createContext<PanelState>({ panel: null, reload: () => {}, switchBranch: async () => {}, can: () => false });

/** The shop panel's shared state: which shop (branch) is open and what the signed-in person may do there. */
export function ShopPanelProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<ShopPanel | null>(null);
  const reload = useCallback(() => {
    api.manage.panel().then(setPanel, () => {});
  }, []);
  useEffect(() => {
    storage.get(BRANCH_KEY).then((id) => {
      if (id) setShopBranch(id);
      reload();
    }, reload);
  }, [reload]);
  const switchBranch = useCallback(async (id: string) => {
    setShopBranch(id);
    await storage.set(BRANCH_KEY, id).catch(() => {});
    setPanel(null);
    reload();
  }, [reload]);
  const can = useCallback((need: ShopRole) => !!panel && RANK[panel.role] >= RANK[need], [panel]);
  return <Ctx.Provider value={{ panel, reload, switchBranch, can }}>{children}</Ctx.Provider>;
}

export const useShopPanel = () => useContext(Ctx);

export const ROLE_LABEL: Record<ShopRole, string> = { owner: "Owner", manager: "Manager", front_desk: "Front desk" };
