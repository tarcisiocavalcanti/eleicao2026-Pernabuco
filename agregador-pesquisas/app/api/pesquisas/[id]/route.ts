import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.pesquisa.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const pesquisa = await prisma.pesquisa.findUnique({
    where: { id: params.id },
    include: { cenarios: { include: { resultados: { include: { candidato: true } } } } },
  });
  if (!pesquisa) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json(pesquisa);
}
