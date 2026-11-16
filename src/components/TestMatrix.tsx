import { useState } from "react";
import { ROLES, resources } from "../data/extra";

const SCOPE_MEANING: Record<string, string> = {
  T: "todos os registros da empresa",
  E: "apenas a própria equipe",
  P: "apenas os próprios registros",
  "—": "sem acesso",
};

const CHECKS: { cat: string; items: string[] }[] = [
  {
    cat: "Autenticação",
    items: [
      "Login com senha errada → mensagem genérica e contador de tentativas",
      "Login correto regenera o ID da sessão",
      "Sessão expira por inatividade e redireciona",
      "Token de reset usado duas vezes é recusado",
      "Bloqueio progressivo após N falhas",
    ],
  },
  {
    cat: "Autorização",
    items: [
      "Matriz completa: cada papel × cada permissão",
      "Trocar UID na URL não dá acesso a registro de outro escopo",
      "Usuário sem permissão recebe 403; registro fora de escopo, 404",
      "Permissão alterada é aplicada imediatamente (cache invalidado)",
      "Ação crítica exige reautenticação",
    ],
  },
  {
    cat: "Injeção e XSS",
    items: [
      "Campo de busca com aspas e comentário SQL não altera a query",
      "Ordenação com coluna inválida cai na allowlist",
      "Nome de cliente com <script> é exibido como texto",
      "CSP ativa sem unsafe-inline",
    ],
  },
  {
    cat: "CSRF e requisição manipulada",
    items: [
      "POST sem token → 419",
      "Token de outra sessão → 419",
      "Replay de POST → novo token exigido",
      "Método trocado (GET em rota de POST) → 405",
    ],
  },
  {
    cat: "Upload e arquivos",
    items: [
      "Upload de .php é recusado",
      "Arquivo com MIME adulterado é recusado",
      "Nome com ../ não escapa do storage",
      "Download de arquivo alheio → 404",
      "Download e exclusão geram auditoria",
    ],
  },
  {
    cat: "Banco e concorrência",
    items: [
      "Falha no meio da venda → rollback completo",
      "Duas abas movendo o mesmo card → conflito de versão",
      "Registro duplicado viola UNIQUE e é tratado",
      "EXPLAIN das consultas críticas sem filesort",
    ],
  },
  {
    cat: "Interface",
    items: [
      "Responsivo em 320, 375, 390, 430, 768, 1024, 1280, 1440 e 1920",
      "Navegação completa por teclado com foco visível",
      "Erro de formulário associado ao campo",
      "Exclusão pede confirmação digitada",
      "Toast e modal com aria-live",
    ],
  },
];

export function TestMatrix() {
  const [role, setRole] = useState<string>("Vendedor");

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-3">
          Matriz de permissões — clique em um papel
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-full px-3.5 py-1.5 text-xs ${
                role === r ? "bg-[#c8f54a] text-[#0b0c0a]" : "border border-white/10 text-[#b7b3a8] hover:border-[#c9a36a]/40"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-white/8 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#141512]">
                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.14em] uppercase text-[#c9a36a] border-b border-white/8">
                  Permissão
                </th>
                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.14em] uppercase text-[#c9a36a] border-b border-white/8">
                  {role}
                </th>
                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.14em] uppercase text-[#8d897e] border-b border-white/8 hidden sm:table-cell">
                  Significado
                </th>
                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.14em] uppercase text-[#8d897e] border-b border-white/8 hidden md:table-cell">
                  Outros papéis
                </th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => {
                const v = r.allow[role] ?? "—";
                const tone =
                  v === "T"
                    ? "text-[#c8f54a] bg-[#c8f54a]/10 border-[#c8f54a]/25"
                    : v === "E"
                    ? "text-[#c9a36a] bg-[#c9a36a]/10 border-[#c9a36a]/25"
                    : v === "P"
                    ? "text-[#8fd3ff] bg-[#8fd3ff]/10 border-[#8fd3ff]/25"
                    : "text-[#8d897e] bg-white/5 border-white/10";
                return (
                  <tr key={r.key} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[11px] text-[#efe8db]">{r.key}</span>
                      <span className="block text-[11px] text-[#8d897e]">{r.label}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`font-mono text-[11px] rounded-full border px-2.5 py-0.5 ${tone}`}>{v}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[#a9a49a] text-[12.5px] hidden sm:table-cell">{SCOPE_MEANING[v]}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell">
                      <span className="font-mono text-[11px] text-[#8d897e]">
                        {ROLES.filter((x) => x !== role)
                          .map((x) => `${x.split(" ")[0]}:${r.allow[x] ?? "—"}`)
                          .join("  ·  ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-[#8d897e] mt-3 font-mono">T = todos · E = equipe · P = próprio · — = negado</p>
      </div>

      <div>
        <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-3">
          Verificações obrigatórias de QA por categoria
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {CHECKS.map((c) => (
            <div key={c.cat} className="rounded-xl border border-white/8 p-4">
              <p className="font-serif text-xl text-[#efe8db]">{c.cat}</p>
              <ul className="mt-2.5 space-y-1.5">
                {c.items.map((i) => (
                  <li key={i} className="flex gap-2 text-[13px] text-[#b7b3a8] leading-relaxed">
                    <span className="text-[#c8f54a] mt-[1px]">✓</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
