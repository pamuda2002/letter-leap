import { PrismaClient } from "./src/generated/prisma/client.js";

async function main() {
  try {
    const prisma = new PrismaClient({} as any);
    console.log("Success instantiating with {}");
  } catch (e) {
    console.error("Error with {}", e);
  }
}

main();
