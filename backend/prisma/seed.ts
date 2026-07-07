import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEFAULT_ADMIN = {
  nip: 'admin123',
  namaLengkap: 'Administrator',
  password: 'password123',
  role: 'admin',
};

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' },
  });

  if (existingAdmin) {
    console.log(
      `Admin user already exists (NIP: ${existingAdmin.nip}), skipping seed.`,
    );
    return;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      nip: DEFAULT_ADMIN.nip,
      namaLengkap: DEFAULT_ADMIN.namaLengkap,
      password: hashedPassword,
      role: DEFAULT_ADMIN.role,
    },
  });

  console.log(`Default admin user created (NIP: ${admin.nip}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
