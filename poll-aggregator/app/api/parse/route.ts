import { NextRequest, NextResponse } from "next/server";
import { parseWikiPolls } from "@/lib/parseWikiPolls";

export const revalidate = 3600; // 1h cache (ISR-style for route handlers)

function normalizeWikiUrl(input: string): string | null {
  try {
    let url = input.trim();
    if (!/^https?:\/\//i.test(url)) {
      // allow passing just an article title
      url = `https://en.wikipedia.org/wiki/${encodeURIComponent(url.replace(/ /g, "_"))}`;
    }
    const u = new URL(url);
    if (!/(^|\.)wikipedia\.org$/i.test(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "Parâmetro 'url' é obrigatório." }, { status: 400 });
  }
  const url = normalizeWikiUrl(raw);
  if (!url) {
    return NextResponse.json(
      { error: "URL inválida. Use um link de artigo da Wikipédia (ex: https://en.wikipedia.org/wiki/Opinion_polling_for_the_...)." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "poll-aggregator/1.0 (educational project)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Falha ao buscar a página (status ${res.status}).` }, { status: 502 });
    }
    const html = await res.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const sourceTitle = titleMatch ? titleMatch[1].replace(" - Wikipedia", "") : url;

    const parsed = parseWikiPolls(html, sourceTitle);
    if (!parsed) {
      return NextResponse.json(
        { error: "Não encontrei uma tabela de pesquisas reconhecível nessa página." },
        { status: 422 }
      );
    }

    return NextResponse.json({ ...parsed, sourceUrl: url, fetchedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao buscar/processar a página." }, { status: 500 });
  }
}
