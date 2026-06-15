require('dotenv/config');
const { PrismaClient } = require('../dist/generated/prisma');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// Initial users for QA. In PROD, the Admin creates analysts through the
// backoffice (MS-09). Complainants (denunciantes) have NO account — they
// use anonymous crypto tokens issued by MS-02.
// ─────────────────────────────────────────────────────────────────────────────

const ANALYSTS = [
  { email: 'analyst01@uce.edu.ec', name: 'Analista 01' },
  { email: 'analyst02@uce.edu.ec', name: 'Analista 02' },
  { email: 'analyst03@uce.edu.ec', name: 'Analista 03' },
  { email: 'analyst04@uce.edu.ec', name: 'Analista 04' },
  { email: 'analyst05@uce.edu.ec', name: 'Analista 05' },
  { email: 'analyst06@uce.edu.ec', name: 'Analista 06' },
  { email: 'analyst07@uce.edu.ec', name: 'Analista 07' },
  { email: 'analyst08@uce.edu.ec', name: 'Analista 08' },
  { email: 'analyst09@uce.edu.ec', name: 'Analista 09' },
  { email: 'analyst10@uce.edu.ec', name: 'Analista 10' },
];

async function main() {
  console.log('🌱 Iniciando el sembrador de AnonyGate...');

  // ── 1. Create roles (idempotent) ──────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  const analystRole = await prisma.role.upsert({
    where: { name: 'analyst' },
    update: {},
    create: { name: 'analyst' },
  });

  console.log('✅ Roles creados: admin, analyst');

  // ── 2. Default password hash ──────────────────────────────────────────────
  // QA: default password '12345' for all users.
  // PROD: Admin resets each analyst's password from the backoffice.
  const defaultPasswordHash = await bcrypt.hash('12345', 10);

  // ── 3. Create Admin (upsert — never duplicates) ───────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@uce.edu.ec' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'admin@uce.edu.ec',
      passwordHash: defaultPasswordHash,
      userRoles: { create: { roleId: adminRole.id } },
    },
  });

  console.log(`👑 Admin: ${adminUser.email}`);

  // ── 4. Create Analysts (upsert — never duplicates) ──────────────────────
  // upsert ensures that if they already exist (populated DB), their real data
  // (assigned cases, history, etc.) is untouched. Only the password hash is
  // updated — useful for resetting passwords in QA.
  for (const analyst of ANALYSTS) {
    const user = await prisma.user.upsert({
      where: { email: analyst.email },
      update: { passwordHash: defaultPasswordHash }, // solo actualiza contraseña
      create: {
        email: analyst.email,
        passwordHash: defaultPasswordHash,
        userRoles: { create: { roleId: analystRole.id } },
      },
    });
    console.log(`🕵️  Analista: ${user.email}`);
  }

  console.log('\n✅ Database seeded successfully.');
  console.log('──────────────────────────────────────');
  console.log('  Admin    : admin@uce.edu.ec');
  console.log('  Analysts : analyst01..10@uce.edu.ec');
  console.log('  Password : 12345 (change in PROD)');
  console.log('──────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
