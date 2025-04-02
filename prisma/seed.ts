import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    
  // Clear existing data
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();
  await prisma.stolenToken.deleteMany();

  // Create users
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      membershipLevel: "vip",
    },
  });

  // Create Posts
  await prisma.post.create({
    data: {
      userId: admin.id,
      author: "admin",
      content: "Welcome to our vulnerable board!",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
