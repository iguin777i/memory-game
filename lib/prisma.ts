import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    errorFormat: 'pretty'
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientSingleton | undefined
}

const prisma = global.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma