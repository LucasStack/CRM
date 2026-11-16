import { useEffect, useState } from "react";
import { Bell, HelpCircle, LogOut, Menu, Search, User as UserIcon, X } from "lucide-react";
import { StoreProvider, useCrm } from "./crm/store";
import type { View } from "./crm/store";
import { ROLES } from "./crm/rbac";
import { Badge, Btn, Field, Input, Panel } from "./crm/ui";
import { CommandPalette } from "./crm/CommandPalette";
import { HelpDrawer } from "./crm/HelpDrawer";
import { Dashboard } from "./crm/views/Dashboard";
import { Clients, Leads } from "./crm/views/Crm";
import { Files, Pipeline, Tasks } from "./crm/views/Operations";
import { Catalog, Finance, Quotes, Reports, Sales } from "./crm/views/Commercial";
import { AuditView, Lgpd, SettingsView, Users } from "./crm/views/Governance";
import { Profile } from "./crm/views/Profile";
import { Setup } from "./crm/views/Setup";
import { Landing } from "./marketing/Landing";
import { BlueprintDoc } from "./doc/BlueprintDoc";

type Mode = "site" | "console" | "doc";

const NAV: { label: string; items: { id: View; label: string }[] }[] = [
  { label: "Painel", items: [{ id: "dashboard", label: "Dashboard" }] },
  {
    label: "CRM",
    items: [
      { id: "clients", label: "Clientes" },
      { id: "leads", label: "Leads" },
      { id: "pipeline", label: "Pipeline" },
    ],
  },
  {
    label: "Comercial",
    items: [
      { id: "catalog", label: "Produtos e serviços" },
      { id: "quotes", label: "Propostas" },
      { id: "sales", label: "Vendas" },
      { id: "finance", label: "Financeiro" },
    ],
  },
  {
    label: "Operação",
    items: [
      { id: "tasks", label: "Tarefas e agenda" },
      { id: "files", label: "Documentos" },
    ],
  },
  { label: "Dados", items: [{ id: "reports", label: "Relatórios" }] },
  {
    label: "Governança",
    items: [
      { id: "users", label: "Usuários" },
      { id: "audit", label: "Auditoria" },
      { id: "lgpd", label: "LGPD" },
      { id: "settings", label: "Configurações" },
    ],
  },
  { label: "Conta", items: [{ id: "profile", label: "Meu perfil" }] },
];

export default function App() {
  return (
    <StoreProvider>
      <Root />
    </StoreProvider>
  );
}

function Root() {
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem("crmcore.mode") as Mode) ?? "site",
  );
  const { session, isFirstRun } = useCrm();

  useEffect(() => {
    localStorage.setItem("crmcore.mode", mode);
  }, [mode]);

  if (mode === "doc") return <BlueprintDoc onBack={() => setMode("site")} />;
  if (mode === "site" && !session) {
    return <Landing onOpenApp={() => setMode("console")} onDoc={() => setMode("doc")} />;
  }
  if (!session) {
    // console solicitado; se não há admin ainda, entra no onboarding
    if (isFirstRun()) return <Setup onExit={() => setMode("site")} />;
    return <LoginScreen onDoc={() => setMode("doc")} onSite={() => setMode("site")} />;
  }
  return <Console onDoc={() => setMode("doc")} onSite={() => setMode("site")} />;
}

function LoginScreen({ onDoc, onSite }: { onDoc: () => void; onSite: () => void }) {
  const { login, s } = useCrm();
  const [email, setEmail] = useState(s.users[0]?.email ?? "");
  const [pass, setPass] = useState(s.users[0]?.pass ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0c0a] text-[#efe8db] grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-10 border-r border-white/8 relative overflow-hidden">
        <div className="absolute inset-0 grid-fine opacity-40" />
        <div className="relative">
          <button onClick={onSite} className="text-[12px] text-[#8d897e] hover:text-[#c8f54a]">
            ← voltar ao site
          </button>
        </div>
        <div className="relative max-w-md">
          <p className="font-mono text-[11px] tracking-[0.26em]">CRM CORE</p>
          <h1 className="font-serif text-5xl leading-tight mt-4">
            Sessão curta.
            <br />
            <span className="italic text-[#c9a36a]">Trilha longa.</span>
          </h1>
          <p className="mt-5 text-[#b7b3a8] leading-relaxed">
            Bloqueio progressivo após {s.settings.maxLoginAttempts} tentativas, mensagem genérica para evitar
            enumeração de contas e cada ação relevante gravada em auditoria.
          </p>
          <button onClick={onDoc} className="mt-6 text-[13px] text-[#c8f54a] underline underline-offset-4">
            Ver o blueprint arquitetural
          </button>
        </div>
        <p className="relative font-mono text-[10px] text-[#8d897e]">
          dados persistem no seu navegador · exporte um backup em Configurações
        </p>
      </div>

      <div className="flex items-center justify-center p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            const r = login(email, pass);
            setMsg(r.ok ? null : r.msg);
            setBusy(false);
          }}
          className="w-full max-w-sm space-y-5"
        >
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">CONSOLE</p>
            <h2 className="font-serif text-4xl mt-2">Entrar</h2>
          </div>
          <Field label="E-mail">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" />
          </Field>
          <Field label="Senha">
            <Input value={pass} onChange={(e) => setPass(e.target.value)} type="password" autoComplete="current-password" />
          </Field>
          {msg && (
            <p className="text-[13px] text-[#ff8b7a] rounded-xl border border-[#ff6b5a]/30 bg-[#ff6b5a]/8 p-3">{msg}</p>
          )}
          <Btn type="submit" disabled={busy} className="w-full">Autenticar</Btn>

          {s.users.length > 1 && (
            <Panel className="p-4">
              <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-2">
                Contas disponíveis
              </p>
              <div className="space-y-1.5 max-h-52 overflow-y-auto nexo-scroll">
                {s.users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setEmail(u.email);
                      setPass(u.pass);
                    }}
                    className="w-full flex items-center justify-between gap-2 text-left text-[12.5px] text-[#cfc9bc] hover:text-[#c8f54a]"
                  >
                    <span>{ROLES[u.role].label}</span>
                    <span className="font-mono text-[11px] text-[#8d897e] truncate">{u.email}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11.5px] text-[#8d897e] mt-3 leading-relaxed">
                Compare escopos entrando com papéis diferentes.
              </p>
            </Panel>
          )}
        </form>
      </div>
    </div>
  );
}

function Console({ onDoc, onSite }: { onDoc: () => void; onSite: () => void }) {
  const { view, setView, me, logout, s, markAllRead, markRead, toast, touch, session } = useCrm();
  const [nav, setNav] = useState(false);
  const [bell, setBell] = useState(false);
  const [palette, setPalette] = useState(false);
  const [help, setHelp] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);
  const u = me()!;
  const unread = s.notifications.filter((n) => n.userId === u.id && !n.readAt);

  useEffect(() => {
    const evt = () => touch();
    window.addEventListener("click", evt);
    window.addEventListener("keydown", evt);
    return () => {
      window.removeEventListener("click", evt);
      window.removeEventListener("keydown", evt);
    };
  }, [touch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
      if (e.key === "?" && !palette && !help) setHelp(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [palette, help]);

  useEffect(() => {
    const t = window.setInterval(() => {
      if (!session) return;
      const idle = Date.now() - session.lastSeen;
      if (idle > s.settings.sessionIdle * 60_000) logout("inatividade");
    }, 15_000);
    return () => window.clearInterval(t);
  }, [session, s.settings.sessionIdle, logout]);

  const screen = {
    dashboard: <Dashboard />,
    clients: <Clients />,
    leads: <Leads />,
    pipeline: <Pipeline />,
    catalog: <Catalog />,
    quotes: <Quotes />,
    sales: <Sales />,
    finance: <Finance />,
    tasks: <Tasks />,
    files: <Files />,
    reports: <Reports />,
    users: <Users />,
    audit: <AuditView />,
    lgpd: <Lgpd />,
    settings: <SettingsView />,
    profile: <Profile />,
  }[view];

  return (
    <div className="min-h-screen bg-[#0b0c0a] text-[#efe8db]">
      <div className="pointer-events-none fixed inset-0 grid-fine opacity-25" />

      <header className="sticky top-0 z-30 bg-[#0b0c0a]/90 backdrop-blur border-b border-white/8">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => setNav(!nav)} className="lg:hidden text-[#c9a36a]">
            {nav ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <span className="font-mono text-[11px] tracking-[0.24em] truncate max-w-[140px] sm:max-w-none">
            {s.settings.systemName.toUpperCase()}
          </span>
          <span className="hidden md:block text-[11px] text-[#8d897e] font-mono">/ console</span>

          <button
            onClick={() => setPalette(true)}
            className="hidden md:flex ml-4 items-center gap-2 rounded-full border border-white/10 bg-[#141512] px-3 py-1.5 text-[12px] text-[#8d897e] hover:border-[#c9a36a]/40 hover:text-[#efe8db]"
          >
            <Search className="w-3.5 h-3.5" />
            Buscar…
            <span className="font-mono text-[10px] text-[#8d897e] ml-2 border-l border-white/10 pl-2">⌘K</span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={onSite} className="hidden lg:block text-[11px] font-mono text-[#8d897e] hover:text-[#c8f54a]">
              site
            </button>
            <button onClick={onDoc} className="hidden sm:block text-[11px] font-mono text-[#8d897e] hover:text-[#c8f54a]">
              blueprint
            </button>
            <button
              onClick={() => setHelp(true)}
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-[#c9a36a]/40"
              title="Ajuda (?)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                onClick={() => setBell(!bell)}
                className="relative w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-[#c9a36a]/40"
              >
                <Bell className="w-4 h-4" />
                {unread.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c8f54a] text-[#0b0c0a] text-[9px] font-mono flex items-center justify-center">
                    {unread.length}
                  </span>
                )}
              </button>
              {bell && (
                <div className="absolute right-0 top-11 w-80 rounded-2xl border border-white/10 bg-[#141512] overflow-hidden z-40">
                  <div className="p-3 border-b border-white/8 flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e]">NOTIFICAÇÕES</span>
                    <button onClick={markAllRead} className="text-[11px] text-[#c9a36a]">
                      marcar todas
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto nexo-scroll divide-y divide-white/5">
                    {unread.length === 0 && <p className="p-4 text-[12.5px] text-[#8d897e]">Nada novo.</p>}
                    {unread.map((n) => (
                      <div key={n.id} className="p-3 flex gap-2">
                        <div className="flex-1">
                          <p className="text-[13px]">{n.title}</p>
                          <p className="text-[12px] text-[#8d897e]">{n.body}</p>
                        </div>
                        <button onClick={() => markRead(n.id)} className="text-[11px] text-[#c8f54a]">
                          ok
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative pl-2 border-l border-white/8">
              <button
                onClick={() => setAccountMenu(!accountMenu)}
                className="flex items-center gap-2 text-left rounded-full hover:bg-white/5 pr-2 pl-1 py-1"
              >
                <span className="w-8 h-8 rounded-full bg-[#c9a36a]/20 text-[#c9a36a] flex items-center justify-center font-mono text-[12px]">
                  {u.name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                </span>
                <span className="hidden sm:block">
                  <span className="block text-[12.5px] leading-tight">{u.name.split(" ")[0]}</span>
                  <span className="font-mono text-[10px] text-[#8d897e]">{ROLES[u.role].label}</span>
                </span>
              </button>
              {accountMenu && (
                <div className="absolute right-0 top-11 w-56 rounded-2xl border border-white/10 bg-[#141512] overflow-hidden z-40">
                  <div className="px-3 py-3 border-b border-white/8">
                    <p className="text-[13px]">{u.name}</p>
                    <p className="text-[11px] text-[#8d897e] truncate">{u.email}</p>
                    <Badge tone={u.twoFactor ? "lime" : "fog"}>2FA {u.twoFactor ? "ativo" : "off"}</Badge>
                  </div>
                  <button
                    onClick={() => { setView("profile"); setAccountMenu(false); }}
                    className="w-full text-left px-3 py-2 text-[13px] hover:bg-white/5 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5" /> Minha conta
                  </button>
                  <button
                    onClick={() => { setView("settings"); setAccountMenu(false); }}
                    className="w-full text-left px-3 py-2 text-[13px] hover:bg-white/5"
                  >
                    Configurações
                  </button>
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-3 py-2 text-[13px] hover:bg-white/5 text-[#ff8b7a] flex items-center gap-2 border-t border-white/8"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`${
            nav ? "block" : "hidden"
          } lg:block w-full lg:w-[230px] shrink-0 lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] overflow-y-auto nexo-scroll border-r border-white/8 px-3 py-5 bg-[#0b0c0a] z-20`}
        >
          {NAV.map((g) => (
            <div key={g.label} className="mb-5">
              <p className="px-2 font-mono text-[10px] tracking-[0.18em] text-[#8d897e] mb-1.5">
                {g.label.toUpperCase()}
              </p>
              <div className="space-y-0.5">
                {g.items.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => {
                      setView(it.id);
                      setNav(false);
                    }}
                    className={`w-full text-left rounded-lg px-2.5 py-2 text-[13px] transition ${
                      view === it.id
                        ? "bg-[#c8f54a]/10 text-[#c8f54a]"
                        : "text-[#a9a49a] hover:bg-white/5 hover:text-[#efe8db]"
                    }`}
                  >
                    {it.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="mx-2 mt-2 rounded-xl border border-white/8 p-3">
            <p className="font-mono text-[10px] text-[#8d897e] tracking-[0.14em]">SESSÃO</p>
            <p className="text-[12px] mt-1.5">Inatividade: {s.settings.sessionIdle} min</p>
            <p className="text-[12px]">Bloqueio após {s.settings.maxLoginAttempts} falhas</p>
            <button onClick={() => setPalette(true)} className="mt-2 text-[12px] text-[#c9a36a]">
              ⌘K · Paleta de comandos
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 md:p-7 max-w-full">{screen}</main>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <HelpDrawer open={help} onClose={() => setHelp(false)} />

      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] rounded-2xl bg-[#efe8db] text-[#0b0c0a] px-4 py-3 text-[13px] shadow-2xl rise max-w-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
