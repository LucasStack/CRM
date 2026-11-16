import type { ReactNode } from "react";
import {
  Boxes,
  CreditCard,
  LayoutDashboard,
  Lock,
  Package,
  Server,
  Sparkles,
  Star,
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { useStore } from "../state/Store";
import type { View } from "../types";
import { Input } from "./primitives";

const GROUPS: { label: string; items: { id: View; label: string; icon: typeof Store }[] }[] = [
  {
    label: "Operação",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "orders", label: "Pedidos", icon: Truck },
      { id: "payments", label: "Pagamentos", icon: CreditCard },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { id: "products", label: "Produtos", icon: Package },
      { id: "inventory", label: "Estoque", icon: Boxes },
      { id: "recs", label: "Recomendações", icon: Sparkles },
    ],
  },
  {
    label: "Relação",
    items: [
      { id: "reviews", label: "Avaliações", icon: Star },
      { id: "customers", label: "Clientes", icon: Users },
      { id: "sellers", label: "Vendedores", icon: Store },
    ],
  },
  {
    label: "Plataforma",
    items: [
      { id: "billing", label: "Cobrança", icon: Wallet },
      { id: "architecture", label: "Arquitetura", icon: Server },
      { id: "security", label: "Segurança", icon: Lock },
    ],
  },
];

export function Shell({ children }: { children: ReactNode }) {
  const { view, setView, session, logout, query, setQuery, toast, setRoute } = useStore();

  return (
    <div className="min-h-screen bg-[#0b0c0a] text-[#efe8db] flex">
      <aside className="hidden lg:flex w-[240px] shrink-0 flex-col border-r border-white/8 bg-[#0e0f0d]">
        <button
          onClick={() => setRoute("landing")}
          className="flex items-center gap-3 px-5 h-16 border-b border-white/8 text-left"
        >
          <img src="/images/nexo-mark.png" alt="" className="w-8 h-8 rounded-md object-cover" />
          <div>
            <p className="font-mono text-[11px] tracking-[0.24em]">NEXO</p>
            <p className="text-[10px] text-[#8d897e]">Marketplace OS</p>
          </div>
        </button>
        <nav className="flex-1 overflow-y-auto nexo-scroll py-4 px-3 space-y-5">
          {GROUPS.map((g) => (
            <div key={g.label}>
              <p className="px-2 font-mono text-[10px] tracking-[0.18em] text-[#8d897e] mb-1.5">{g.label.toUpperCase()}</p>
              <div className="space-y-0.5">
                {g.items.map((it) => {
                  const active = view === it.id;
                  const Icon = it.icon;
                  return (
                    <button
                      key={it.id}
                      onClick={() => setView(it.id)}
                      className={`w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition ${
                        active ? "bg-[#c8f54a] text-[#0b0c0a]" : "text-[#cfc9bc] hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {it.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/8">
          <p className="text-sm">{session?.name}</p>
          <p className="text-[11px] text-[#8d897e] truncate">{session?.email}</p>
          <button onClick={logout} className="mt-2 text-[11px] text-[#c9a36a] hover:underline">
            Encerrar sessão
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-white/8 flex items-center gap-3 px-4 md:px-6">
          <div className="lg:hidden flex items-center gap-2 mr-1">
            <img src="/images/nexo-mark.png" alt="" className="w-7 h-7 rounded-md" />
          </div>
          <div className="flex-1 max-w-xl">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto, pedido, cliente…"
            />
          </div>
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <span className="flex items-center gap-2 font-mono text-[10px] text-[#c8f54a]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8f54a] live-dot" />
              LIVE · AWS sa-east-1
            </span>
          </div>
        </header>
        <div className="lg:hidden overflow-x-auto border-b border-white/8 px-3 py-2 flex gap-1">
          {GROUPS.flatMap((g) => g.items).map((it) => (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs ${view === it.id ? "bg-[#c8f54a] text-[#0b0c0a]" : "text-[#b7b3a8] border border-white/10"}`}
            >
              {it.label}
            </button>
          ))}
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#efe8db] text-[#0b0c0a] px-4 py-3 text-sm shadow-2xl rise">
          {toast.msg}
        </div>
      )}
    </div>
  );
}
