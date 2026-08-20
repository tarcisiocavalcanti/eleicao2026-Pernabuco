import { prisma } from "@/lib/prisma";
import FiltersBar from "@/components/FiltersBar";
import EvolucaoChart from "@/components/EvolucaoChart";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(d));
}

export default async function Home({
  searchParams,
}: {
  searchParams: { abrangencia?: string; cargo?: string };
}) {
  const pesquisas = await prisma.pesquisa.findMany({
    where: {
      ...(searchParams.abrangencia ? { abrangencia: searchParams.abrangencia } : {}),
      ...(searchParams.cargo ? { cargo: searchParams.cargo } : {}),
    },
    include: {
      cenarios: { include: { resultados: { include: { candidato: true } } } },
    },
    orderBy: { dataDivulgacao: "desc" },
  });

  return (
    <div className="wrap">
      <header className="masthead">
        <div>
          <p className="masthead-sub">Boletim de acompanhamento</p>
          <h1 className="masthead-title">Painel de Pesquisas — PE &amp; Brasil</h1>
        </div>
        <span className="stamp">{pesquisas.length} pesquisa(s) registrada(s)</span>
      </header>

      <FiltersBar
        abrangencia={searchParams.abrangencia}
        cargo={searchParams.cargo}
      />

      {pesquisas.length === 0 && (
        <p className="empty">Nenhuma pesquisa cadastrada para esse filtro ainda.</p>
      )}

      {searchParams.cargo && <EvolucaoChart pesquisas={pesquisas} />}

      {pesquisas.map((p) => (
        <article className="card" key={p.id}>
          <div className="card-head">
            <span className="card-inst">{p.instituto}</span>
            <span className="card-meta">
              {p.abrangencia === "BR" ? "Brasil" : p.municipio || p.abrangencia} ·{" "}
              {p.cargo} · divulgada em {formatDate(p.dataDivulgacao)}
            </span>
          </div>
          <div className="card-body">
            {p.cenarios.map((c) => (
              <div key={c.id}>
                <p className="cenario-label">
                  {c.tipo}
                  {c.descricao ? ` — ${c.descricao}` : ""}
                </p>
                {c.resultados
                  .sort((a, b) => b.percentual - a.percentual)
                  .map((r) => (
                    <div className="results-row" key={r.id}>
                      <span className="cand-name">
                        {r.candidato.nome}
                        {r.candidato.partido ? ` (${r.candidato.partido})` : ""}
                      </span>
                      <span className="cand-pct">{r.percentual.toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            ))}
            {p.amostra || p.margemErro ? (
              <p className="card-meta" style={{ marginTop: 10 }}>
                {p.amostra ? `Amostra: ${p.amostra}` : ""}
                {p.amostra && p.margemErro ? " · " : ""}
                {p.margemErro ? `Margem de erro: ±${p.margemErro}pp` : ""}
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
