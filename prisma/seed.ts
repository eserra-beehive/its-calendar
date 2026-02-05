import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@its.it";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log(`Admin ${email} già esistente, skip.`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, password: hashed, name: "Admin" },
  });

  console.log(`Admin creato: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
