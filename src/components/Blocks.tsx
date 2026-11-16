import type { Block } from "../data/blueprint";

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-7">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p className="text-[#cfc9bc] leading-[1.75] text-[15px]">{block.text}</p>;

    case "list":
      return (
        <ul className="space-y-2.5">
          {block.items.map((it) => (
            <li key={it} className="flex gap-3 text-[15px] text-[#cfc9bc] leading-relaxed">
              <span className="text-[#c9a36a] mt-[2px]">—</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );

    case "cards":
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          {block.items.map((c) => (
            <div key={c.t} className="rounded-xl border border-white/8 bg-[#141512] p-5">
              <h4 className="font-serif text-xl text-[#efe8db]">{c.t}</h4>
              <p className="text-sm text-[#a9a49a] mt-1.5 leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      );

    case "code":
      return (
        <div className="rounded-xl border border-[#c9a36a]/18 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#141512] border-b border-white/8">
            <span className="font-mono text-[10px] tracking-[0.18em] text-[#c9a36a] uppercase">{block.lang}</span>
            <span className="font-mono text-[10px] text-[#8d897e]">{block.code.length} linhas</span>
          </div>
          <pre className="p-4 overflow-x-auto nexo-scroll bg-[#0b0c0a] font-mono text-[12px] leading-[1.7] text-[#c9d1c0]">
{block.code.join("\n")}
          </pre>
        </div>
      );

    case "table":
      return (
        <div className="rounded-xl border border-white/8 overflow-hidden">
          {block.caption && (
            <p className="px-4 py-3 bg-[#141512] border-b border-white/8 font-mono text-[10px] tracking-[0.16em] uppercase text-[#8d897e]">
              {block.caption}
            </p>
          )}
          <div className="overflow-x-auto nexo-scroll">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#141512]">
                  {block.head.map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.14em] uppercase text-[#c9a36a] whitespace-nowrap border-b border-white/8"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((r, ri) => (
                  <tr key={ri} className="hover:bg-white/[0.02]">
                    {r.map((c, ci) => (
                      <td
                        key={ci}
                        className={`px-4 py-3 border-b border-white/5 align-top leading-relaxed ${
                          ci === 0 ? "text-[#efe8db] font-medium whitespace-nowrap" : "text-[#b7b3a8]"
                        }`}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "flow":
      return (
        <ol className="relative space-y-0">
          {block.steps.map((s, i) => (
            <li key={s} className="relative pl-9 pb-5 last:pb-0">
              {i < block.steps.length - 1 && (
                <span className="absolute left-[11px] top-6 bottom-0 w-px bg-gradient-to-b from-[#c9a36a]/50 to-white/8" />
              )}
              <span className="absolute left-0 top-1 w-[22px] h-[22px] rounded-full border border-[#c9a36a]/40 bg-[#141512] flex items-center justify-center font-mono text-[10px] text-[#c9a36a]">
                {i + 1}
              </span>
              <p className="text-[14px] text-[#cfc9bc] leading-relaxed pt-0.5">{s}</p>
            </li>
          ))}
        </ol>
      );

    case "tree":
      return (
        <div className="rounded-xl border border-white/8 bg-[#0e0f0d] p-5 overflow-x-auto nexo-scroll">
          <pre className="font-mono text-[12.5px] leading-[1.9] text-[#cfc9bc]">
            {block.lines.map((l, i) => (
              <div key={i} style={{ paddingLeft: l.d * 22 }} className="whitespace-pre">
                <span className="text-[#efe8db]">{l.label}</span>
                {l.note && <span className="text-[#8d897e]">   {l.note}</span>}
              </div>
            ))}
          </pre>
        </div>
      );

    case "checklist":
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          {block.items.map((c, i) => (
            <div key={c.t} className="rounded-xl border border-white/8 p-4 flex gap-3">
              <span className="font-mono text-[11px] text-[#c8f54a] mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm text-[#efe8db]">{c.t}</p>
                <p className="text-[13px] text-[#a9a49a] mt-1 leading-relaxed">{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      );

    case "callout": {
      const map = {
        gold: "border-[#c9a36a]/35 bg-[#c9a36a]/6",
        lime: "border-[#c8f54a]/30 bg-[#c8f54a]/5",
        red: "border-[#ff6b5a]/35 bg-[#ff6b5a]/6",
      };
      const label = {
        gold: "text-[#c9a36a]",
        lime: "text-[#c8f54a]",
        red: "text-[#ff8b7a]",
      };
      return (
        <div className={`rounded-xl border p-5 ${map[block.tone]}`}>
          <p className={`font-mono text-[10px] tracking-[0.18em] uppercase ${label[block.tone]}`}>
            {block.title}
          </p>
          <p className="text-[15px] text-[#cfc9bc] mt-2 leading-relaxed">{block.text}</p>
        </div>
      );
    }
  }
}
