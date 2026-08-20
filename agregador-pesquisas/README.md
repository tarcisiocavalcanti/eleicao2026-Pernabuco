# Agregador de Pesquisas — PE & Brasil

Site que agrega pesquisas eleitorais de Pernambuco e do Brasil. Página pública
com filtros e uma área `/admin` protegida por senha para cadastrar os dados
(sem cadastro público, sem coleta em campo — é só um repositório de resultados
já publicados por institutos).

## Stack

- Next.js 14 (App Router) — frontend + API routes, roda nativo na Vercel
- Prisma + Postgres (Neon ou Supabase)
- Autenticação simples por senha única (cookie assinado), pensada para 1 admin

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL e SESSION_SECRET
npx prisma db push     # cria as tabelas no banco

# cria os usuários admin (ytalo e tarcisio) com senha com hash (bcrypt)
ADMIN_YTALO_PASSWORD="senha-forte-1" ADMIN_TARCISIO_PASSWORD="senha-forte-2" npm run db:seed-admins

npm run dev
```

Acesse `http://localhost:3000` (público) e `http://localhost:3000/admin`
(login com usuário `ytalo` ou `tarcisio` e a senha definida no seed).

### Administradores

Autenticação é por usuário + senha (senha guardada como hash bcrypt no
banco, nunca em texto puro). Os dois admins já configurados no seed são
`ytalo` e `tarcisio`.

- **Trocar a senha de alguém**: rode `npm run db:seed-admins` de novo com a
  variável de ambiente correspondente atualizada — é upsert, então só
  sobrescreve o hash.
- **Adicionar um terceiro admin**: adicione uma chamada a `upsertAdmin(...)`
  em `prisma/seed.js` com o novo usuário e rode o seed.
- **Remover um admin**: `npx prisma studio` (ou uma query direta) e apague o
  registro na tabela `Admin`.

## Deploy na Vercel

1. Suba este projeto num repositório Git (GitHub/GitLab) e importe na Vercel
   (**New Project → Import**).
2. Na aba **Storage** do projeto na Vercel, adicione um banco **Postgres**
   (integração com Neon) — isso já preenche `DATABASE_URL` e `DIRECT_URL`
   automaticamente nas variáveis de ambiente.
3. Em **Settings → Environment Variables**, adicione:
   - `SESSION_SECRET` — uma string aleatória longa (ex: gerada com
     `openssl rand -hex 32`)
4. Rode `npx prisma db push` contra o banco de produção uma vez (localmente,
   com o `DATABASE_URL` de produção no `.env`, ou via `vercel env pull`).
5. Rode o seed dos admins contra o banco de produção:
   `ADMIN_YTALO_PASSWORD="..." ADMIN_TARCISIO_PASSWORD="..." npm run db:seed-admins`
   (use senhas fortes e diferentes das de desenvolvimento).
6. Deploy. Pronto — o site público fica na raiz, e `ytalo`/`tarcisio` entram
   em `/admin` com usuário e senha pra cadastrar as pesquisas.

## Estrutura dos dados

- **Pesquisa**: instituto, cargo, abrangência (Brasil / PE / município),
  datas de campo e divulgação, amostra, margem de erro, fonte.
- **Cenário**: cada pesquisa pode ter mais de um cenário (estimulada,
  espontânea, rejeição).
- **Candidato** / **Resultado**: percentual de cada candidato dentro de
  um cenário.

Isso permite comparar institutos diferentes, acompanhar evolução no tempo,
e filtrar por Brasil, Pernambuco ou um município específico.

## Funcionalidades já incluídas

- Cadastro manual de pesquisa (`/admin/pesquisas/nova`)
- Importação em lote via CSV colado (`/admin/pesquisas/importar`) — uma linha
  por candidato; linhas com mesmo instituto+cargo+abrangência+data+cenário são
  agrupadas automaticamente na mesma pesquisa. O formato de colunas está
  descrito na própria página de importação.
- Exclusão de pesquisas no painel admin
- Gráfico de evolução (cenário estimulado) na página pública, exibido quando
  um cargo específico é filtrado

## Próximos passos sugeridos

- Edição de pesquisas já cadastradas (hoje só há criação e exclusão)
- Upload de arquivo `.csv` (hoje é colar o texto) — trocar o parser simples
  por uma lib como PapaParse se o CSV tiver vírgulas dentro de campos
- Paginação na listagem pública quando o volume de pesquisas crescer
