/**
 * Two-column tradeoff table. `rows` is an array of [rowLabel, leftValue,
 * rightValue] tuples (authored inline in MDX frontmatter-free JSX).
 */
export function Compare({
  left,
  right,
  rows,
}: {
  left: string;
  right: string;
  rows: [string, string, string][];
}) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border-2">
            <th className="w-1/4 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wide text-muted-fg" />
            <th className="px-3 py-2 text-left font-semibold text-[#B48BFF]">{left}</th>
            <th className="px-3 py-2 text-left font-semibold text-emerald">{right}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border">
              <td className="px-3 py-2 font-mono text-[11px] text-muted-fg">{row[0]}</td>
              <td className="px-3 py-2 text-text-2">{row[1]}</td>
              <td className="px-3 py-2 text-text-2">{row[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
