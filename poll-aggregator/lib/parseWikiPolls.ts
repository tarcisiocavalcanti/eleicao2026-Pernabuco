import * as cheerio from "cheerio";

export interface PollRow {
  date: string; // display string as found (fieldwork end date when a range)
  dateSort: number; // timestamp used for sorting/charting
  pollster: string;
  sample: string;
  results: Record<string, number>; // party label -> percentage
  lead: string;
}

export interface ParsedPollTable {
  parties: string[];
  rows: PollRow[];
  sourceTitle: string;
}

const clean = (s: string) =>
  s
    .replace(/\[[^\]]*\]/g, "") // footnote markers [1]
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toNumber = (s: string): number | null => {
  const t = clean(s).replace(",", ".").replace("%", "");
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  const n = parseFloat(t);
  if (Number.isNaN(n)) return null;
  return n;
};

// Very loose date parser: tries to pull the LAST date out of a range like
// "12–15 Mar 2026" or "2026-03-15" or "15 March 2026"
const MONTHS: Record<string, number> = {
  jan: 0, fev: 1, feb: 1, mar: 2, abr: 3, apr: 3, mai: 4, may: 4, jun: 5,
  jul: 6, ago: 7, aug: 7, set: 8, sep: 8, out: 9, oct: 9, nov: 10, dez: 11, dec: 11,
};

function parseDateGuess(raw: string): { display: string; sort: number } {
  const s = clean(raw);
  // ISO
  let m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return { display: s, sort: d.getTime() };
  }
  // e.g. "12-15 Mar 2026" or "12 - 15 March 2026" -> take last day + month + year
  m = s.match(/(\d{1,2})\s*[–\-to]+\s*(\d{1,2})\s+([A-Za-zçãéíóú]+)\.?\s+(\d{4})/i);
  if (m) {
    const monthKey = m[3].slice(0, 3).toLowerCase();
    const month = MONTHS[monthKey];
    if (month !== undefined) {
      const d = new Date(Number(m[4]), month, Number(m[2]));
      return { display: s, sort: d.getTime() };
    }
  }
  // e.g. "15 March 2026" or "15 Mar 2026"
  m = s.match(/(\d{1,2})\s+([A-Za-zçãéíóú]+)\.?\s+(\d{4})/i);
  if (m) {
    const monthKey = m[2].slice(0, 3).toLowerCase();
    const month = MONTHS[monthKey];
    if (month !== undefined) {
      const d = new Date(Number(m[3]), month, Number(m[1]));
      return { display: s, sort: d.getTime() };
    }
  }
  // e.g. "March 2026"
  m = s.match(/([A-Za-zçãéíóú]+)\.?\s+(\d{4})/i);
  if (m) {
    const monthKey = m[1].slice(0, 3).toLowerCase();
    const month = MONTHS[monthKey];
    if (month !== undefined) {
      const d = new Date(Number(m[2]), month, 1);
      return { display: s, sort: d.getTime() };
    }
  }
  return { display: s || "?", sort: 0 };
}

export function parseWikiPolls(html: string, sourceTitle: string): ParsedPollTable | null {
  const $ = cheerio.load(html);
  const tables = $("table.wikitable");

  let best: ParsedPollTable | null = null;
  let bestScore = 0;

  tables.each((_, table) => {
    const $table = $(table);
    const headerRow = $table.find("tr").first();
    const headers: string[] = [];
    headerRow.find("th").each((__, th) => {
      const colspan = parseInt($(th).attr("colspan") || "1", 10);
      const text = clean($(th).text());
      for (let i = 0; i < colspan; i++) headers.push(text);
    });
    if (headers.length < 3) return;

    const dateIdx = headers.findIndex((h) =>
      /date|data|fieldwork|período/i.test(h)
    );
    const pollsterIdx = headers.findIndex((h) =>
      /polling firm|pollster|institut|empresa|firm|conducted/i.test(h)
    );
    if (dateIdx === -1) return;

    // candidate party columns: everything that isn't date/pollster/sample/lead/source
    const skipRe = /date|data|fieldwork|período|polling firm|pollster|institut|empresa|firm|conducted|sample|amostra|source|fonte|lead|margin|undecided|other|ref/i;

    const bodyRows = $table.find("tr").slice(1);
    const rows: PollRow[] = [];
    const partyTotals: Record<string, number> = {};
    const partyCounts: Record<string, number> = {};

    bodyRows.each((__, tr) => {
      const cells = $(tr).find("td");
      if (cells.length < 3) return;
      const cellTexts: string[] = [];
      cells.each((___, td) => {
        const colspan = parseInt($(td).attr("colspan") || "1", 10);
        const text = clean($(td).text());
        for (let i = 0; i < colspan; i++) cellTexts.push(text);
      });
      if (cellTexts.length < headers.length - 2) return; // too sparse to align

      const dateRaw = cellTexts[dateIdx] || "";
      if (!dateRaw) return;
      const { display, sort } = parseDateGuess(dateRaw);
      if (!sort) return;

      const pollster = pollsterIdx >= 0 ? cellTexts[pollsterIdx] || "" : "";

      const results: Record<string, number> = {};
      headers.forEach((h, idx) => {
        if (idx === dateIdx || idx === pollsterIdx) return;
        if (skipRe.test(h)) return;
        if (!h) return;
        const val = toNumber(cellTexts[idx] || "");
        if (val === null) return;
        if (val < 0 || val > 100) return;
        results[h] = val;
        partyTotals[h] = (partyTotals[h] || 0) + val;
        partyCounts[h] = (partyCounts[h] || 0) + 1;
      });

      if (Object.keys(results).length < 2) return; // need at least 2 parties to be a poll row

      rows.push({
        date: display,
        dateSort: sort,
        pollster: pollster || "—",
        sample: "",
        results,
        lead: "",
      });
    });

    if (rows.length < 3) return;

    const parties = Object.keys(partyTotals)
      .filter((p) => partyCounts[p] >= Math.max(2, Math.floor(rows.length * 0.3)))
      .sort((a, b) => (partyTotals[b] / partyCounts[b]) - (partyTotals[a] / partyCounts[a]));

    if (parties.length < 2) return;

    const score = rows.length * parties.length;
    if (score > bestScore) {
      bestScore = score;
      rows.sort((a, b) => b.dateSort - a.dateSort);
      best = { parties: parties.slice(0, 8), rows, sourceTitle };
    }
  });

  return best;
}
