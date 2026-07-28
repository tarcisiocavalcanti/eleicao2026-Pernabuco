"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
interface ChartRow {
  dateSort: number;
  results: Record<string, number>;
}

const PALETTE = [
  "#ffb300", "#3fa796", "#c6453a", "#6b7f91",
  "#8f7fd9", "#e0a3d0", "#5fb0e8", "#d1943c",
];

function fmtDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" });
}

export default function TrendChart({ rows, parties }: { rows: ChartRow[]; parties: string[] }) {
  const data = [...rows]
    .sort((a, b) => a.dateSort - b.dateSort)
    .map((r) => {
      const point: Record<string, number | string> = { dateSort: r.dateSort, dateLabel: fmtDate(r.dateSort) };
      parties.forEach((p) => {
        if (r.results[p] !== undefined) point[p] = r.results[p];
      });
      return point;
    });

  return (
    <ResponsiveContainer width="100%" height={380}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="rgba(242,239,233,0.08)" vertical={false} />
        <XAxis
          dataKey="dateLabel"
          tick={{ fill: "#6b7f91", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }}
          axisLine={{ stroke: "rgba(242,239,233,0.14)" }}
          tickLine={false}
          minTickGap={40}
        />
        <YAxis
          tick={{ fill: "#6b7f91", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }}
          axisLine={false}
          tickLine={false}
          unit="%"
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: "#14181a",
            border: "1px solid rgba(242,239,233,0.14)",
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 12,
          }}
          labelStyle={{ color: "#ffb300" }}
        />
        <Legend wrapperStyle={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, paddingTop: 12 }} />
        {parties.map((p, i) => (
          <Line
            key={p}
            type="monotone"
            dataKey={p}
            stroke={PALETTE[i % PALETTE.length]}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
