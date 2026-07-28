import Link from "next/link";
import { parseWikiPolls } from "@/lib/parseWikiPolls";
import TrendChart from "@/app/components/TrendChart";

export const revalidate = 3600; // re-busca a página-fonte a cada hora

function average(rows: { results: Record<string, number> }[], party: string, n: number) {
  const vals = rows.slice(0, n).map((r) => r.results[party]).filter((v) => v !== undefined) as number[];
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export default async function ElectionPage({
  searchParams,
}: {
  searchParams: { url?: string };
}) {
  const rawUrl = searchParams.url;

  if (!rawUrl) {
    return (
      <Shell>
        <ErrorBox msg="Nenhuma URL informada. Volte e cole o link de uma página de pesquisas da Wikipédia." />
      </Shell>
    );
  }

  let html: string;
  let sourceTitle = rawUrl;
  try {
    const res = await fetch(rawUrl, {
      headers: { "User-Agent": "poll-aggregator/1.0 (educational project)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return (
        <Shell>
          <ErrorBox msg={`Não consegui buscar essa página (status ${res.status}).`} />
        </Shell>
      );
    }
    html = await res.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) sourceTitle = titleMatch[1].replace(" - Wikipedia", "");
  } catch {
    return (
      <Shell>
        <ErrorBox msg="Erro ao buscar a página informada." />
      </Shell>
    );
  }

  const parsed = parseWikiPolls(html, sourceTitle);
  if (!parsed) {
    return (
      <Shell>
        <ErrorBox msg="Não encontrei uma tabela de pesquisas reconhecível nessa página. Tente outro artigo (ex.: 'Opinion polling for the next ...')." />
      </Shell>
    );
  }

  const { parties, rows, sourceTitle: title } = parsed;
  const latest5 = rows.slice(0, 5);

  return (
    <Shell>
      <p className="eyebrow">Fonte: {title}</p>
      <h1 className="display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", margin: "0.4rem 0 0.2rem", fontWeight: 700 }}>
        {title.replace(/^Opinion polling for /i, "").replace(/^the /i, "")}
      </h1>
      <p style={{ color: "var(--steel)", fontSize: "0.9rem" }}>
        {rows.length} pesquisas identificadas · atualizado a cada hora ·{" "}
        <a href={rawUrl} target="_blank" rel="noreferrer" style={{ color: "var(--amber)" }}>
          ver fonte original ↗
        </a>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem", margin: "2rem 0" }}>
        {parties.map((p) => {
          const avg = average(rows, p, 5);
          return (
            <div key={p} className="card" style={{ padding: "1rem" }}>
              <div className="mono" style={{ fontSize: "0.7rem", color: "var(--steel)", letterSpacing: "0.05em" }}>
                {p.toUpperCase()}
              </div>
              <div className="mono" style={{ fontSize: "1.9rem", color: "var(--amber)", marginTop: "0.2rem" }}>
                {avg !== null ? avg.toFixed(1) : "—"}%
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--steel)" }}>média · últimas 5</div>
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
              <th>Data</th>
              <th>Instituto</th>
              {parties.map((p) => (
                <th key={p}>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="mono">{r.date}</td>
                <td>{r.pollster}</td>
                {parties.map((p) => (
                  <td key={p} className="mono">
                    {r.results[p] !== undefined ? `${r.results[p]}%` : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <Link href="/" className="mono" style={{ color: "var(--steel)", fontSize: "0.85rem", textDecoration: "none" }}>
        ← voltar
      </Link>
      <div style={{ marginTop: "1.5rem" }}>{children}</div>
    </main>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="card" style={{ padding: "1.5rem", borderColor: "var(--signal-down)" }}>
      <p className="eyebrow" style={{ color: "var(--signal-down)" }}>Erro</p>
      <p style={{ marginTop: "0.5rem" }}>{msg}</p>
    </div>
  );
}
