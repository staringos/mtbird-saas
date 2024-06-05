// import { PrismaClient } from "@prisma/client";
type PrismaClient = import('@prisma/client').PrismaClient 


declare module '*.less' {
  const resource: {[key: string]: string};
  export = resource;
}

declare module NodeJS {
  interface Global {
    prisma: PrismaClient;
  }
}
