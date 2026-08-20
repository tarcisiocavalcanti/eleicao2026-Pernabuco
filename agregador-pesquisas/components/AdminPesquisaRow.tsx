"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPesquisaRow({
  id,
  instituto,
  cargo,
  local,
  data,
}: {
  id: string;
  instituto: string;
  cargo: string;
  local: string;
  data: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Excluir a pesquisa "${instituto} — ${cargo}"?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/pesquisas/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Erro ao excluir.");
      setDeleting(false);
    }
  }

  return (
    <div className="results-row" style={{ padding: "10px 0" }}>
      <span className="cand-name">
        {instituto} — {cargo} ({local})
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="card-meta">{data}</span>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleDelete}
          disabled={deleting}
          style={{ padding: "4px 10px", fontSize: "0.68rem" }}
        >
          {deleting ? "..." : "Excluir"}
        </button>
      </span>
    </div>
  );
}
