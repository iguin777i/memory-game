import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ['error', 'warn'],
    connectionLimit: 5,
    pool: {
      min: 0,
      max: 5,
      idleTimeoutMillis: 30000,
    },
  })
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export { prisma }

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} else {
  // In production, we want to ensure we're not creating multiple instances
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma
  }
} 