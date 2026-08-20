"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TEMPLATE =
  "instituto,cargo,abrangencia,municipio,dataCampoInicio,dataCampoFim,dataDivulgacao,amostra,margemErro,fonteUrl,tipoCenario,candidato,partido,percentual\n" +
  "Instituto X,governador,PE,,2026-08-01,2026-08-05,2026-08-10,800,2.0,https://...,estimulada,Fulano,PT,32.5\n" +
  "Instituto X,governador,PE,,2026-08-01,2026-08-05,2026-08-10,800,2.0,https://...,estimulada,Beltrano,PL,28.1";

type Row = Record<string, string>;

function parseCsv(text: string): Row[] {
  const lines = text.trim().split("\n").filter(Boolean);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Row = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));
    return row;
  });
}

// Agrupa linhas (uma por candidato) em pesquisas + cenário, pela combinação
// instituto + cargo + abrangencia + dataDivulgacao + tipoCenario
function groupRows(rows: Row[]) {
  const groups = new Map<string, { meta: Row; candidatos: Row[] }>();
  for (const row of rows) {
    const key = [row.instituto, row.cargo, row.abrangencia, row.dataDivulgacao, row.tipoCenario].join(
      "|"
    );
    if (!groups.has(key)) groups.set(key, { meta: row, candidatos: [] });
    groups.get(key)!.candidatos.push(row);
  }
  return Array.from(groups.values());
}

export default function ImportarCsv() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  async function handleImport() {
    setRunning(true);
    setLog([]);
    try {
      const rows = parseCsv(text);
      const groups = groupRows(rows);
      let ok = 0;

      for (const g of groups) {
        const resultados = [];
        for (const c of g.candidatos) {
          if (!c.candidato || !c.percentual) continue;
          const res = await fetch("/api/candidatos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome: c.candidato, partido: c.partido }),
          });
          if (!res.ok) throw new Error(`Erro ao salvar candidato ${c.candidato}`);
          const candidato = await res.json();
          resultados.push({ candidatoId: candidato.id, percentual: c.percentual });
        }

        const m = g.meta;
        const pesquisaRes = await fetch("/api/pesquisas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pesquisa: {
              instituto: m.instituto,
              contratante: m.contratante,
              cargo: m.cargo,
              abrangencia: m.abrangencia,
              municipio: m.municipio,
              dataCampoInicio: m.dataCampoInicio,
              dataCampoFim: m.dataCampoFim,
              dataDivulgacao: m.dataDivulgacao,
              amostra: m.amostra,
              margemErro: m.margemErro,
              fonteUrl: m.fonteUrl,
            },
            cenarios: [{ tipo: m.tipoCenario || "estimulada", resultados }],
          }),
        });

        if (!pesquisaRes.ok) {
          const data = await pesquisaRes.json();
          throw new Error(data.error || `Erro ao salvar pesquisa de ${m.instituto}`);
        }
        ok++;
        setLog((prev) => [...prev, `✓ ${m.instituto} — ${m.cargo} (${m.dataDivulgacao})`]);
      }

      setLog((prev) => [...prev, `Concluído: ${ok} pesquisa(s) importada(s).`]);
      setTimeout(() => router.push("/admin"), 1200);
    } catch (err: any) {
      setLog((prev) => [...prev, `✗ Erro: ${err.message}`]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="admin-shell">
      <p className="masthead-sub">Importação em lote</p>
      <h1>Importar CSV</h1>

      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
        Uma linha por candidato. Linhas com o mesmo instituto + cargo + abrangência +
        data de divulgação + tipo de cenário são agrupadas na mesma pesquisa.
      </p>

      <div className="field">
        <label>Modelo de colunas</label>
        <textarea readOnly value={TEMPLATE} rows={4} style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem" }} />
      </div>

      <div className="field">
        <label>Cole o CSV aqui</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={TEMPLATE}
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}
        />
      </div>

      <button className="btn" onClick={handleImport} disabled={running || !text.trim()}>
        {running ? "Importando..." : "Importar"}
      </button>{" "}
      <Link href="/admin" className="btn btn-secondary" style={{ marginLeft: 8 }}>
        Voltar
      </Link>

      {log.length > 0 && (
        <div style={{ marginTop: 20, fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
          {log.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
