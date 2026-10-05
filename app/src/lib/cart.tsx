import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { storage } from "./storage";

const KEY = "af_cart";
const SHOP_KEY = "af_cart_shop";

export type CartItems = Record<string, number>; // productId -> quantity

interface CartState {
  items: CartItems;
  count: number;
  add: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  /** The barbershop that delivers this cart (picked on its page); null = choose at checkout. */
  deliveryShopId: string | null;
  setDeliveryShop: (shopId: string | null) => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItems>({});
  const [deliveryShopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    storage.get(KEY).then((saved) => saved && setItems(JSON.parse(saved)), () => {});
    storage.get(SHOP_KEY).then((saved) => saved && setShopId(saved), () => {});
  }, []);

  const setDeliveryShop = useCallback((id: string | null) => {
    setShopId(id);
    if (id) storage.set(SHOP_KEY, id);
    else storage.remove(SHOP_KEY);
  }, []);

  const update = useCallback((fn: (prev: CartItems) => CartItems) => {
    setItems((prev) => {
      const next = fn(prev);
      storage.set(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const add = useCallback((id: string) => update((prev) => ({ ...prev, [id]: Math.min((prev[id] ?? 0) + 1, 20) })), [update]);
  const setQuantity = useCallback(
    (id: string, quantity: number) =>
      update((prev) => {
        const next = { ...prev };
        if (quantity <= 0) delete next[id];
        else next[id] = Math.min(quantity, 20);
        return next;
      }),
    [update],
  );
  const clear = useCallback(() => update(() => ({})), [update]);

  const value = useMemo(
    () => ({ items, count: Object.values(items).reduce((a, b) => a + b, 0), add, setQuantity, clear, deliveryShopId, setDeliveryShop }),
    [items, add, setQuantity, clear, deliveryShopId, setDeliveryShop],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
