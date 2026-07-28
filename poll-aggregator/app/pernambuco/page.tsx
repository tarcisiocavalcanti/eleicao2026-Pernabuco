import Link from "next/link";
import TrendChart from "@/app/components/TrendChart";
import { PE_GOVERNADOR_POLLS, PE_GOVERNADOR_PARTIES } from "@/lib/pernambuco-data";

function average(rows: typeof PE_GOVERNADOR_POLLS, party: string, n: number) {
  const sorted = [...rows].sort((a, b) => b.dateSort - a.dateSort);
  const vals = sorted.slice(0, n).map((r) => r.results[party]).filter((v) => v !== undefined) as number[];
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export default function PernambucoPage() {
  const rows = [...PE_GOVERNADOR_POLLS].sort((a, b) => b.dateSort - a.dateSort);
  const parties = PE_GOVERNADOR_PARTIES;

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <Link href="/" className="mono" style={{ color: "var(--steel)", fontSize: "0.85rem", textDecoration: "none" }}>
        ← voltar
      </Link>

      <p className="eyebrow" style={{ marginTop: "1.5rem" }}>Dados curados manualmente · sem fonte estruturada aberta</p>
      <h1 className="display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", margin: "0.4rem 0 0.2rem", fontWeight: 700 }}>
        Governador de Pernambuco 2026
      </h1>
      <p style={{ color: "var(--steel)", fontSize: "0.9rem" }}>
        {rows.length} pesquisas registradas · cenário estimulado de 1º turno
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem", margin: "2rem 0" }}>
        {parties.map((p) => {
          const avg = average(rows, p, 3);
          return (
            <div key={p} className="card" style={{ padding: "1rem" }}>
              <div className="mono" style={{ fontSize: "0.7rem", color: "var(--steel)", letterSpacing: "0.05em" }}>
                {p.toUpperCase()}
              </div>
              <div className="mono" style={{ fontSize: "1.9rem", color: "var(--amber)", marginTop: "0.2rem" }}>
                {avg !== null ? avg.toFixed(1) : "—"}%
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--steel)" }}>média · últimas pesquisas</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: "1.25rem", marginBottom: "2.5rem" }}>
        <TrendChart rows={rows} parties={parties} />
      </div>

      <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>Pesquisas individuais</p>
      <div className="scroll-x card">
        <table>
          <thead>
            <tr>
              <th>Data (campo)</th>
              <th>Instituto</th>
              <th>Amostra</th>
              {parties.map((p) => (
                <th key={p}>{p}</th>
              ))}
              <th>Fonte</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="mono">{r.date}</td>
                <td>{r.pollster}</td>
                <td>{r.sample}</td>
                {parties.map((p) => (
                  <td key={p} className="mono">
                    {r.results[p] !== undefined ? `${r.results[p]}%` : "—"}
                  </td>
                ))}
                <td>
                  <a href={r.source} target="_blank" rel="noreferrer" style={{ color: "var(--amber)" }}>
                    ver ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: "1.25rem", marginTop: "2rem" }}>
        <p className="eyebrow" style={{ color: "var(--amber)" }}>Como adicionar uma pesquisa nova</p>
        <p style={{ color: "var(--steel)", fontSize: "0.88rem", lineHeight: 1.7, marginTop: "0.5rem" }}>
          Edite <code>lib/pernambuco-data.ts</code> e adicione um novo objeto no array{" "}
          <code>PE_GOVERNADOR_POLLS</code> com data, instituto, amostra, os percentuais e o
          link da fonte. Ao dar commit/push, a Vercel republica o site automaticamente em
          menos de 1 minuto.
        </p>
      </div>
    </main>
  );
}
