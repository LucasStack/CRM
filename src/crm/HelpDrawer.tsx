import { X } from "lucide-react";

const SHORTCUTS = [
  ["⌘/Ctrl + K", "Abrir a paleta de comandos"],
  ["G depois D", "Ir para o Dashboard"],
  ["G depois C", "Ir para Clientes"],
  ["G depois P", "Ir para Pipeline"],
  ["G depois V", "Ir para Vendas"],
  ["Esc", "Fechar modais e diálogos"],
];

const CHECKLIST = [
  "Aceite a política e configure empresa/admin no primeiro acesso.",
  "Convide sua equipe em Governança → Usuários. Cada papel já vem com escopo próprio.",
  "Cadastre 2 ou 3 produtos/serviços com preço em Comercial → Produtos.",
  "Crie uma proposta, envie e transforme em venda para testar o fluxo completo.",
  "Registre uma tarefa e veja a notificação no sino do topo.",
  "Em Configurações → Backup, exporte um JSON de segurança.",
  "Alterne para outro papel de demonstração para ver o escopo em ação.",
];

export function HelpDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/55" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0e0f0d] border-l border-white/10 overflow-y-auto nexo-scroll"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-[#c9a36a]">AJUDA</p>
            <h3 className="font-serif text-2xl">Como usar o CRM Core</h3>
          </div>
          <button onClick={onClose} className="text-[#8d897e] hover:text-[#efe8db]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-8">
          <section>
            <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-3">Primeiros passos</p>
            <ol className="space-y-2">
              {CHECKLIST.map((it, i) => (
                <li key={it} className="flex gap-3 text-[13.5px] text-[#cfc9bc] leading-relaxed">
                  <span className="font-mono text-[11px] text-[#c9a36a] w-5 shrink-0">{i + 1}.</span>
                  {it}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-3">Atalhos de teclado</p>
            <div className="rounded-xl border border-white/8 divide-y divide-white/5">
              {SHORTCUTS.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[13px] text-[#cfc9bc]">{v}</span>
                  <span className="font-mono text-[11px] text-[#c9a36a] bg-[#141512] border border-white/10 rounded-lg px-2 py-0.5">
                    {k}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-3">Boas práticas</p>
            <ul className="space-y-2 text-[13px] text-[#cfc9bc] leading-relaxed">
              <li>— Ative <strong>2FA</strong> na sua conta em Minha conta → Segurança.</li>
              <li>— Faça um <strong>backup em JSON</strong> antes de importar dados reais.</li>
              <li>— Trabalhe por <strong>tarefas</strong>: o dashboard prioriza o que vence hoje.</li>
              <li>— Confira <strong>Auditoria</strong> após ações críticas — nada escapa da trilha.</li>
              <li>— Ao encerrar o expediente, use <strong>Logout</strong>: sessão curta é sua amiga.</li>
            </ul>
          </section>
        </div>
      </aside>
    </div>
  );
}
