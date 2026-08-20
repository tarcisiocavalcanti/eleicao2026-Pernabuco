import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/pesquisas?abrangencia=PE&cargo=governador
// Rota pública — usada pela página inicial para listar e filtrar pesquisas.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const abrangencia = searchParams.get("abrangencia") || undefined;
  const cargo = searchParams.get("cargo") || undefined;

  const pesquisas = await prisma.pesquisa.findMany({
    where: {
      ...(abrangencia ? { abrangencia } : {}),
      ...(cargo ? { cargo } : {}),
    },
    include: {
      cenarios: {
        include: {
          resultados: {
            include: { candidato: true },
          },
        },
      },
    },
    orderBy: { dataDivulgacao: "desc" },
  });

  return NextResponse.json(pesquisas);
}

// POST /api/pesquisas — protegida pelo middleware (exige login de admin)
// Espera: { pesquisa: {...}, cenarios: [{ tipo, resultados: [{ candidatoId, percentual }] }] }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pesquisa, cenarios } = body;

  if (!pesquisa?.instituto || !pesquisa?.cargo || !pesquisa?.abrangencia) {
    return NextResponse.json(
      { error: "Instituto, cargo e abrangência são obrigatórios" },
      { status: 400 }
    );
  }

  if (!cenarios || cenarios.length === 0) {
    return NextResponse.json(
      { error: "É necessário pelo menos um cenário com resultados" },
      { status: 400 }
    );
  }

  const created = await prisma.pesquisa.create({
    data: {
      instituto: pesquisa.instituto,
      contratante: pesquisa.contratante || null,
      cargo: pesquisa.cargo,
      abrangencia: pesquisa.abrangencia,
      municipio: pesquisa.municipio || null,
      dataCampoInicio: new Date(pesquisa.dataCampoInicio),
      dataCampoFim: new Date(pesquisa.dataCampoFim),
      dataDivulgacao: new Date(pesquisa.dataDivulgacao),
      amostra: pesquisa.amostra ? Number(pesquisa.amostra) : null,
      margemErro: pesquisa.margemErro ? Number(pesquisa.margemErro) : null,
      registroTse: pesquisa.registroTse || null,
      fonteUrl: pesquisa.fonteUrl || null,
      observacoes: pesquisa.observacoes || null,
      cenarios: {
        create: cenarios.map((c: any) => ({
          tipo: c.tipo,
          descricao: c.descricao || null,
          resultados: {
            create: c.resultados.map((r: any) => ({
              candidatoId: r.candidatoId,
              percentual: Number(r.percentual),
            })),
          },
        })),
      },
    },
    include: { cenarios: { include: { resultados: true } } },
  });

  return NextResponse.json(created, { status: 201 });
}
