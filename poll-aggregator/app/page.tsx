const CURATED = [
  {
    label: "Brasil 2026 — Presidencial",
    title: "Opinion polling for the 2026 Brazilian presidential election",
    slug: "Opinion_polling_for_the_2026_Brazilian_presidential_election",
  },
  {
    label: "Reino Unido — Próxima eleição geral",
    title: "Opinion polling for the next United Kingdom general election",
    slug: "Opinion_polling_for_the_next_United_Kingdom_general_election",
  },
  {
    label: "Alemanha — Próxima eleição federal",
    title: "Opinion polling for the next German federal election",
    slug: "Opinion_polling_for_the_next_German_federal_election",
  },
];

const TICKER_ITEMS = [
  "DATAFOLHA", "QUAEST", "IPEC", "PODERDATA", "YOUGOV", "IPSOS",
  "MORE IN COMMON", "INFRATEST DIMAP", "FORSA", "OPINIUM", "AtlasIntel",
];

export default function Home() {
  return (
    <main>
      <section className="wire-ticker" aria-hidden="true">
        <div className="wire-ticker__track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span
              key={i}
              className="mono"
              style={{ padding: "0.6rem 1.4rem", fontSize: "0.78rem", color: "var(--steel)" }}
            >
              ● {t}
            </span>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "4.5rem 1.5rem 5rem" }}>
        <p className="eyebrow" style={{ marginBottom: "1rem" }}>
          Agregador de pesquisas · atualização automática
        </p>
        <h1
          className="display"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.4rem)", lineHeight: 0.98, margin: 0, fontWeight: 700 }}
        >
          Apuração
          <br />
          Contínua
        </h1>
        <p style={{ maxWidth: 560, marginTop: "1.5rem", color: "var(--steel)", fontSize: "1.05rem", lineHeight: 1.6 }}>
          Cole o link da página de pesquisas de opinião de qualquer eleição na Wikipédia.
          O agente lê a tabela, calcula a tendência por partido/candidato e mantém o
          painel atualizado sozinho — sem precisar recadastrar nada.
        </p>

        <form action="/election" method="GET" style={{ marginTop: "2.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 380px" }}>
            <input
              type="url"
              name="url"
              required
              placeholder="https://en.wikipedia.org/wiki/Opinion_polling_for_..."
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Analisar página →
          </button>
        </form>

        <div style={{ marginTop: "3.5rem" }}>
          <p className="eyebrow" style={{ marginBottom: "1rem" }}>Eleições em acompanhamento</p>
          <a
            href="/pernambuco"
            className="card"
            style={{ display: "block", padding: "1.1rem 1.2rem", textDecoration: "none", marginBottom: "0.75rem", borderColor: "var(--amber)" }}
          >
            <span className="mono" style={{ fontSize: "0.7rem", color: "var(--amber)", letterSpacing: "0.06em" }}>
              DADOS CURADOS →
            </span>
            <div className="display" style={{ fontSize: "1.3rem", marginTop: "0.35rem", fontWeight: 600 }}>
              Pernambuco 2026 — Governador
            </div>
          </a>
          <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {CURATED.map((e) => (
              <a
                key={e.slug}
                href={`/election?url=${encodeURIComponent(
                  `https://en.wikipedia.org/wiki/${e.slug}`
                )}`}
                className="card"
                style={{ display: "block", padding: "1.1rem 1.2rem", textDecoration: "none" }}
              >
                <span className="mono" style={{ fontSize: "0.7rem", color: "var(--amber)", letterSpacing: "0.06em" }}>
                  ACOMPANHAR →
                </span>
                <div className="display" style={{ fontSize: "1.3rem", marginTop: "0.35rem", fontWeight: 600 }}>
                  {e.label}
                </div>
              </a>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "4rem", borderTop: "1px solid var(--hair)", paddingTop: "2rem" }}>
          <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>Como funciona</p>
          <ol style={{ color: "var(--steel)", lineHeight: 1.8, paddingLeft: "1.2rem", margin: 0 }}>
            <li>Você aponta a fonte — qualquer artigo de pesquisas de opinião da Wikipédia, em qualquer idioma/país.</li>
            <li>O agente identifica a tabela de pesquisas, os partidos/candidatos e as datas de campo.</li>
            <li>O painel mostra a série histórica, a média das últimas pesquisas e o instituto de cada rodada.</li>
            <li>Os dados são buscados de novo periodicamente — a página nunca fica parada.</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
