import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Iniciando el sembrador de AnonyGate...');

    // 1. Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'admin' }, update: {}, create: { name: 'admin' },
    });

    const analystRole = await prisma.role.upsert({
        where: { name: 'analyst' }, update: {}, create: { name: 'analyst' },
    });

    // 2. Hash the default password '12345'
    const passwordHash = await bcrypt.hash('12345', 10);

    // 3. Create Administrator (If your admin@uce.edu.ec already exists, it will update it)
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@uce.edu.ec' },
        update: { passwordHash },
        create: {
            email: 'admin@uce.edu.ec',
            passwordHash,
            userRoles: { create: { roleId: adminRole.id } }
        },
    });

    // 4. Create Analyst
    const analystUser = await prisma.user.upsert({
        where: { email: 'analyst@uce.edu.ec' },
        update: { passwordHash },
        create: {
            email: 'analyst@uce.edu.ec',
            passwordHash,
            userRoles: { create: { roleId: analystRole.id } }
        },
    });

    console.log('✅ Base de datos poblada con éxito:');
    console.log(`👑 Admin: ${adminUser.email}`);
    console.log(`🕵️ Analista: ${analystUser.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
