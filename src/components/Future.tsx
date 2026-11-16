import { futureExtensions, financialRules, i18nNotes } from "../data/extra";

export function Future() {
  return (
    <div className="space-y-3">
      {futureExtensions.map((f) => (
        <div key={f.t} className="rounded-xl border border-white/8 p-4 grid sm:grid-cols-[160px_1fr_140px] gap-4 items-start">
          <p className="font-serif text-xl text-[#efe8db]">{f.t}</p>
          <p className="text-[13.5px] text-[#b7b3a8] leading-relaxed">{f.d}</p>
          <p className="font-mono text-[11px] text-[#c9a36a]">porta: {f.gate}</p>
        </div>
      ))}
    </div>
  );
}

export function FinancialRules() {
  return (
    <ul className="space-y-2.5">
      {financialRules.map((r) => (
        <li key={r} className="flex gap-3 text-[14.5px] text-[#cfc9bc] leading-relaxed">
          <span className="text-[#c9a36a]">—</span>
          {r}
        </li>
      ))}
    </ul>
  );
}

export function I18nNotes() {
  return (
    <ul className="space-y-2.5">
      {i18nNotes.map((r) => (
        <li key={r} className="flex gap-3 text-[14.5px] text-[#cfc9bc] leading-relaxed">
          <span className="text-[#c9a36a]">—</span>
          {r}
        </li>
      ))}
    </ul>
  );
}
