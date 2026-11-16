import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { orders as seedOrders, reviews as seedReviews, stock as seedStock } from "../data/seed";
import { mintTokens } from "../lib/format";
import type { Order, OrderStatus, Review, Route, Session, StockItem, View } from "../types";

interface Toast {
  id: number;
  msg: string;
}

interface StoreValue {
  route: Route;
  setRoute: (r: Route) => void;
  view: View;
  setView: (v: View) => void;
  session: Session | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  rotateRefresh: () => void;
  stock: StockItem[];
  adjustStock: (id: string, delta: number) => void;
  reviews: Review[];
  replyReview: (id: string, reply: string) => void;
  orders: Order[];
  setOrderStatus: (id: string, status: OrderStatus) => void;
  query: string;
  setQuery: (q: string) => void;
  toast: Toast | null;
  notify: (msg: string) => void;
  selectedProduct: string | null;
  setSelectedProduct: (id: string | null) => void;
}

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>("landing");
  const [view, setView] = useState<View>("dashboard");
  const [session, setSession] = useState<Session | null>(null);
  const [stock, setStock] = useState<StockItem[]>(seedStock);
  const [reviews, setReviews] = useState<Review[]>(seedReviews);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const notify = (msg: string) => {
    const id = Date.now();
    setToast({ id, msg });
    window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2800);
  };

  const login = (email: string, name = "Helena Costa") => {
    const tokens = mintTokens(email);
    setSession({
      name,
      email,
      role: "operadora",
      ...tokens,
      issuedAt: Date.now(),
      accessTtlMs: 12 * 60 * 1000,
    });
    setRoute("app");
    setView("dashboard");
    notify("Sessão iniciada. Access token válido por 12 min.");
  };

  const logout = () => {
    setSession(null);
    setRoute("landing");
    notify("Sessão encerrada. Refresh invalidado.");
  };

  const rotateRefresh = () => {
    if (!session) return;
    const tokens = mintTokens(session.email);
    setSession({ ...session, ...tokens, issuedAt: Date.now() });
    notify("Refresh rotacionado. Família anterior revogada.");
  };

  const adjustStock = (id: string, delta: number) => {
    setStock((rows) =>
      rows.map((r) => (r.id === id ? { ...r, quantity: Math.max(0, r.quantity + delta) } : r)),
    );
    notify(delta > 0 ? "Entrada de estoque registrada." : "Baixa de estoque registrada.");
  };

  const replyReview = (id: string, reply: string) => {
    setReviews((rows) =>
      rows.map((r) => (r.id === id ? { ...r, reply, repliedAt: new Date().toISOString() } : r)),
    );
    notify("Resposta publicada no comentário.");
  };

  const setOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((rows) => rows.map((o) => (o.id === id ? { ...o, status } : o)));
    notify(`Pedido ${id} → ${status}.`);
  };

  const value = useMemo<StoreValue>(
    () => ({
      route,
      setRoute,
      view,
      setView,
      session,
      login,
      logout,
      rotateRefresh,
      stock,
      adjustStock,
      reviews,
      replyReview,
      orders,
      setOrderStatus,
      query,
      setQuery,
      toast,
      notify,
      selectedProduct,
      setSelectedProduct,
    }),
    [route, view, session, stock, reviews, orders, query, toast, selectedProduct],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Store ausente");
  return ctx;
}


