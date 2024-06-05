import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;
const config: any = {};

// if (process.env.DATABASE_DEBUG) {
//   config.log = [
//     {
//       emit: "event",
//       level: "query",
//     },
//   ]
// }

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(config);
} else {
  const anyGlobal = global as any;

  if (!anyGlobal.prisma) {
    anyGlobal.prisma = new PrismaClient(config);
  }

  prisma = anyGlobal.prisma;
}

if (process.env.DATABASE_DEBUG) {
  prisma.$on("query" as any, async (e: any) => {
    console.log(`${e.query} ${e.params}`);
  });
}

export default prisma;
