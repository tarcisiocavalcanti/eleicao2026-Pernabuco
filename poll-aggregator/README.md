# Apuração Contínua — Agregador de Pesquisas Eleitorais

Site em Next.js que lê automaticamente as tabelas de pesquisas de opinião
publicadas na Wikipédia (fonte aberta, atualizada pela comunidade para
centenas de eleições em dezenas de países) e monta um painel com série
histórica, médias e comparação entre institutos.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000

## Publicar na Vercel

**Opção 1 — via GitHub (recomendado)**
1. Crie um repositório no GitHub e suba este projeto:
   ```bash
   git init
   git add .
   git commit -m "primeiro commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```
2. Acesse https://vercel.com/new, importe o repositório.
3. A Vercel detecta automaticamente que é um projeto Next.js — não precisa
   configurar nada. Clique em **Deploy**.

**Opção 2 — via CLI, sem GitHub**
```bash
npm install -g vercel
vercel login
vercel --prod
```

## Como funciona a atualização automática

A página `/election` usa `export const revalidate = 3600`: a cada nova
visita (no máximo 1x por hora), o Next.js busca de novo a página de origem
na Wikipédia e reprocessa a tabela — sem precisar de banco de dados nem
cron job. Se quiser um intervalo diferente, mude o número (em segundos)
em `app/election/page.tsx` e `app/api/parse/route.ts`.

## Adicionar novas eleições em destaque

Edite a lista `CURATED` em `app/page.tsx` com o "slug" do artigo da
Wikipédia (a parte final da URL, depois de `/wiki/`).

## Limitações conhecidas

- O parser é heurístico: funciona bem com o formato-padrão das tabelas
  "wikitable" de pesquisas eleitorais da Wikipédia, mas artigos com
  formatação muito atípica podem não ser reconhecidos.
- Só lê páginas de `wikipedia.org` (por design, para evitar scraping de
  sites que bloqueiam ou têm termos de uso restritivos).
