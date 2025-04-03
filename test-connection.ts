import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Conexão bem sucedida! Resultado:', result);
  } catch (error) {
    console.error('Erro ao conectar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 