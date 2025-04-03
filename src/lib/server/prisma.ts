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
  })
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export { prisma }

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma
  }
} 