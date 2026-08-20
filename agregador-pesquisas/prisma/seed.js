// Cria (ou atualiza a senha de) os administradores do painel.
// Uso:
//   ADMIN_YTALO_PASSWORD="senha-forte-1" ADMIN_TARCISIO_PASSWORD="senha-forte-2" node prisma/seed.js
//
// Rode de novo a qualquer momento (local ou com DATABASE_URL de produção)
// para trocar a senha de um usuário — ele é feito com upsert.

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function upsertAdmin(username, password) {
  if (!password) {
    console.log(`⚠ Pulei "${username}": defina a variável de ambiente correspondente com a senha.`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });
  console.log(`✓ Admin "${username}" criado/atualizado.`);
}

async function main() {
  await upsertAdmin("ytalo", process.env.ADMIN_YTALO_PASSWORD);
  await upsertAdmin("tarcisio", process.env.ADMIN_TARCISIO_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
