import { useMemo, useState } from "react";
import { endpoints } from "../data/extra";

const METHOD: Record<string, string> = {
  GET: "text-[#8fd3ff] border-[#8fd3ff]/30 bg-[#8fd3ff]/10",
  POST: "text-[#c8f54a] border-[#c8f54a]/30 bg-[#c8f54a]/10",
  PUT: "text-[#c9a36a] border-[#c9a36a]/30 bg-[#c9a36a]/10",
  PATCH: "text-[#e8d5a8] border-[#e8d5a8]/30 bg-[#e8d5a8]/10",
  DELETE: "text-[#ff8b7a] border-[#ff8b7a]/30 bg-[#ff8b7a]/10",
};

export function ApiExplorer() {
  const [m, setM] = useState<string>("Todos");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      endpoints.filter((e) => {
        const okM = m === "Todos" || e.method === m;
        const okQ = !q || e.path.toLowerCase().includes(q.toLowerCase()) || e.scope.includes(q.toLowerCase());
        return okM && okQ;
      }),
    [m, q],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        {["Todos", "GET", "POST", "PUT", "PATCH", "DELETE"].map((x) => (
          <button
            key={x}
            onClick={() => setM(x)}
            className={`rounded-full px-3 py-1.5 text-xs font-mono ${
              m === x ? "bg-[#c8f54a] text-[#0b0c0a]" : "border border-white/10 text-[#b7b3a8] hover:border-[#c9a36a]/40"
            }`}
          >
            {x}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="filtrar por caminho ou escopo…"
          className="ml-auto bg-[#0b0c0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#efe8db] outline-none focus:border-[#c9a36a]/50 w-full sm:w-64"
        />
      </div>

      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto nexo-scroll">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#141512]">
                {["Método", "Endpoint", "Escopo", "Descrição", "Rate limit"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.14em] uppercase text-[#c9a36a] whitespace-nowrap border-b border-white/8">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.method + e.path} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5">
                    <span className={`font-mono text-[10px] rounded-full border px-2 py-0.5 ${METHOD[e.method]}`}>
                      {e.method}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-[#efe8db] whitespace-nowrap">{e.path}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-[#c9a36a] whitespace-nowrap">{e.scope}</td>
                  <td className="px-4 py-2.5 text-[#b7b3a8]">{e.desc}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-[#8d897e] whitespace-nowrap">{e.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
