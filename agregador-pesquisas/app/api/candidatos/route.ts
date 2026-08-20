import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const candidatos = await prisma.candidato.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(candidatos);
}

export async function POST(req: NextRequest) {
  const { nome, partido, numero } = await req.json();

  if (!nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const candidato = await prisma.candidato.upsert({
    where: { nome_partido: { nome, partido: partido || "" } },
    update: {},
    create: { nome, partido: partido || "", numero: numero ? Number(numero) : null },
  });

  return NextResponse.json(candidato, { status: 201 });
}
