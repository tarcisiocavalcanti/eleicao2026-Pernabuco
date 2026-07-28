// Dados de pesquisas eleitorais para Governador de Pernambuco 2026.
// Como não existe uma fonte pública estruturada (tipo a tabela da Wikipédia)
// para essa disputa, os dados aqui são curados manualmente a partir de
// matérias publicadas. Para adicionar uma nova pesquisa, copie o formato
// de uma entrada existente e inclua o link da fonte em "source".
//
// Cenário: "estimulado" de 1º turno (com nomes apresentados ao entrevistado).

export interface PEPollRow {
  date: string;       // rótulo exibido
  dateSort: number;    // timestamp (usado pra ordenar/plotar)
  pollster: string;
  sample: string;
  results: Record<string, number>;
  source: string;
}

export const PE_GOVERNADOR_PARTIES = ["Raquel Lyra (PSD)", "João Campos (PSB)"];

export const PE_GOVERNADOR_POLLS: PEPollRow[] = [
  {
    date: "27 fev 2025",
    dateSort: new Date(2025, 1, 27).getTime(),
    pollster: "Quaest",
    sample: "—",
    results: { "Raquel Lyra (PSD)": 28, "João Campos (PSB)": 56 },
    source: "https://g1.globo.com/pe/pernambuco/noticia/2025/02/27/quaest-eleicoes-2026-joao-tem-56percent-raquel-28percent-e-gilson-5percent-na-disputa-pelo-governo-de-pe.ghtml",
  },
  {
    date: "7–9 jul 2026",
    dateSort: new Date(2026, 6, 9).getTime(),
    pollster: "Paraná Pesquisas",
    sample: "1.500 eleitores, 58 municípios",
    results: { "Raquel Lyra (PSD)": 46.8, "João Campos (PSB)": 42.5 },
    source: "https://www.infomoney.com.br/politica/parana-pesquisas-raquel-lyra-e-joao-campos-empatam-tecnicamente-em-pernambuco/",
  },
  {
    date: "22–26 jul 2026",
    dateSort: new Date(2026, 6, 26).getTime(),
    pollster: "Genial/Quaest",
    sample: "900 eleitores",
    results: { "Raquel Lyra (PSD)": 43, "João Campos (PSB)": 37 },
    source: "https://www.correiobraziliense.com.br/politica/2026/07/7469100-genial-quest-raquel-lyra-lidera-corrida-pelo-governo-de-pernambuco-com-43.html",
  },
];
