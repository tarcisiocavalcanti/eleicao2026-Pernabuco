"use client";

import { useRouter } from "next/navigation";

const CARGOS = ["presidente", "governador", "senador", "prefeito", "deputado federal", "deputado estadual"];

export default function FiltersBar({
  abrangencia,
  cargo,
}: {
  abrangencia?: string;
  cargo?: string;
}) {
  const router = useRouter();

  function update(key: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="filters">
      <select
        value={abrangencia || ""}
        onChange={(e) => update("abrangencia", e.target.value)}
      >
        <option value="">Todas as abrangências</option>
        <option value="BR">Brasil</option>
        <option value="PE">Pernambuco</option>
      </select>

      <select value={cargo || ""} onChange={(e) => update("cargo", e.target.value)}>
        <option value="">Todos os cargos</option>
        {CARGOS.map((c) => (
          <option key={c} value={c}>
            {c[0].toUpperCase() + c.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
