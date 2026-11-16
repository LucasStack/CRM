import { alerts, jobs } from "../data/extra";

export function JobsTable() {
  return (
    <div className="rounded-xl border border-white/8 overflow-hidden">
      <div className="overflow-x-auto nexo-scroll">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#141512]">
              {["Job", "Fila", "Gatilho", "Retry", "Chave de idempotência"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.14em] uppercase text-[#c9a36a] whitespace-nowrap border-b border-white/8">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 font-mono text-[12px] text-[#efe8db] whitespace-nowrap">{j.name}</td>
                <td className="px-4 py-2.5">
                  <span className="font-mono text-[10px] rounded-full border border-white/12 px-2 py-0.5 text-[#c9a36a]">
                    {j.queue}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[#b7b3a8] whitespace-nowrap">{j.trigger}</td>
                <td className="px-4 py-2.5 text-[#b7b3a8] whitespace-nowrap">{j.retry}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-[#c8f54a]">{j.idem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AlertsTable() {
  return (
    <div className="rounded-xl border border-white/8 overflow-hidden">
      <div className="overflow-x-auto nexo-scroll">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#141512]">
              {["Alerta", "Sinal", "Limiar", "Canal"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.14em] uppercase text-[#c9a36a] whitespace-nowrap border-b border-white/8">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-[#efe8db] whitespace-nowrap">{a.name}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-[#c9a36a]">{a.signal}</td>
                <td className="px-4 py-2.5 text-[#b7b3a8] whitespace-nowrap">{a.threshold}</td>
                <td className="px-4 py-2.5 text-[#b7b3a8]">{a.channel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
