import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminPesquisaRow from "@/components/AdminPesquisaRow";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const pesquisas = await prisma.pesquisa.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="admin-shell">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="masthead-sub">Painel administrativo</p>
          <h1>Pesquisas cadastradas</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/pesquisas/importar" className="btn btn-secondary">
            Importar CSV
          </Link>
          <Link href="/admin/pesquisas/nova" className="btn">
            + Nova pesquisa
          </Link>
        </div>
      </div>

      {pesquisas.length === 0 && <p className="empty">Nenhuma pesquisa cadastrada ainda.</p>}

      {pesquisas.map((p) => (
        <AdminPesquisaRow
          key={p.id}
          id={p.id}
          instituto={p.instituto}
          cargo={p.cargo}
          local={p.abrangencia === "BR" ? "Brasil" : p.municipio || p.abrangencia}
          data={new Intl.DateTimeFormat("pt-BR").format(p.dataDivulgacao)}
        />
      ))}
    </div>
  );
}
