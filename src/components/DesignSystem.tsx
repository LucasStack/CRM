import { a11y, breakpoints, cssFiles, jsFiles, tokens } from "../data/extra";

export function DesignSystem() {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-3">Tokens de design</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {tokens.map((t) => (
            <div key={t.name} className="flex items-center gap-3 rounded-xl border border-white/8 p-3">
              <span
                className="w-9 h-9 rounded-lg border border-white/10 shrink-0"
                style={{ background: t.value.startsWith("#") ? t.value : "transparent" }}
              />
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-[#c9a36a] truncate">{t.name}</p>
                <p className="text-[12px] text-[#8d897e] truncate">
                  {t.value} · {t.use}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-3">Arquivos CSS (camadas)</p>
          <div className="space-y-2">
            {cssFiles.map((f) => (
              <div key={f.f} className="rounded-xl border border-white/8 p-3.5">
                <p className="font-mono text-[12px] text-[#efe8db]">{f.f}</p>
                <p className="text-[13px] text-[#a9a49a] mt-1">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-3">Módulos JS</p>
          <div className="space-y-2">
            {jsFiles.map((f) => (
              <div key={f.f} className="rounded-xl border border-white/8 p-3.5">
                <p className="font-mono text-[12px] text-[#efe8db]">{f.f}</p>
                <p className="text-[13px] text-[#a9a49a] mt-1">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-3">
          Breakpoints testados (320 → 1920)
        </p>
        <div className="flex items-end gap-2 h-28">
          {breakpoints.map((b) => (
            <div key={b} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
              <div
                className="w-full rounded-t bg-[#c9a36a]/70"
                style={{ height: `${(b / 1920) * 100 + 8}%` }}
              />
              <span className="font-mono text-[9px] text-[#8d897e]">{b}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-3">Acessibilidade</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {a11y.map((a) => (
            <p key={a} className="flex gap-2.5 text-[13.5px] text-[#cfc9bc] leading-relaxed">
              <span className="text-[#c8f54a]">✓</span>
              {a}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
