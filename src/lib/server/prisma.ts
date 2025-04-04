import { PrismaClient } from '@prisma/client'

// Adiciona prisma ao tipo global
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
      {
        emit: 'stdout',
        level: 'query',
      },
    ],
  })
}

// Previne múltiplas instâncias do Prisma Client em desenvolvimento
export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
} 