"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Pesquisa = {
  dataDivulgacao: string | Date;
  instituto: string;
  cenarios: {
    tipo: string;
    resultados: { percentual: number; candidato: { nome: string } }[];
  }[];
};

const CORES = ["#0f5c46", "#a6332e", "#8b9482", "#1a2e22", "#4a7a8c", "#b08d2e"];

export default function EvolucaoChart({ pesquisas }: { pesquisas: Pesquisa[] }) {
  if (pesquisas.length < 2) return null;

  // monta uma linha por data de divulgação, com uma coluna por candidato
  const ordenadas = [...pesquisas].sort(
    (a, b) => new Date(a.dataDivulgacao).getTime() - new Date(b.dataDivulgacao).getTime()
  );

  const candidatosSet = new Set<string>();
  const data = ordenadas.map((p) => {
    const row: Record<string, any> = {
      data: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(
        new Date(p.dataDivulgacao)
      ),
      instituto: p.instituto,
    };
    const cenario = p.cenarios.find((c) => c.tipo === "estimulada") || p.cenarios[0];
    cenario?.resultados.forEach((r) => {
      row[r.candidato.nome] = r.percentual;
      candidatosSet.add(r.candidato.nome);
    });
    return row;
  });

  const candidatos = Array.from(candidatosSet).slice(0, 6);

  return (
    <div className="card" style={{ padding: "18px 22px" }}>
      <p className="cenario-label" style={{ marginTop: 0 }}>
        Evolução (cenário estimulado)
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="2 4" stroke="#c3cab4" />
          <XAxis dataKey="data" tick={{ fontFamily: "IBM Plex Mono", fontSize: 11 }} />
          <YAxis
            tick={{ fontFamily: "IBM Plex Mono", fontSize: 11 }}
            unit="%"
            domain={[0, "dataMax + 10"]}
          />
          <Tooltip
            contentStyle={{ fontFamily: "IBM Plex Mono", fontSize: 12, border: "1px solid #8b9482" }}
          />
          <Legend wrapperStyle={{ fontFamily: "IBM Plex Sans", fontSize: 12 }} />
          {candidatos.map((nome, i) => (
            <Line
              key={nome}
              type="monotone"
              dataKey={nome}
              stroke={CORES[i % CORES.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
