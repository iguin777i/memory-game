import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpa as tabelas existentes
  await prisma.userAchievement.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.score.deleteMany()
  await prisma.user.deleteMany()

  // Cria as conquistas
  const achievements = [
    {
      id: '1',
      name: 'Primeira Vitória',
      description: 'Complete o jogo pela primeira vez',
      points: 100,
      icon: '🏆'
    },
    {
      id: '2',
      name: 'Velocista',
      description: 'Complete o jogo em menos de 60 segundos',
      points: 200,
      icon: '⚡'
    },
    {
      id: '3',
      name: 'Mestre da Memória',
      description: 'Complete o jogo em menos de 45 segundos',
      points: 300,
      icon: '🧠'
    },
    {
      id: '4',
      name: 'Lendário',
      description: 'Complete o jogo em menos de 30 segundos',
      points: 500,
      icon: '👑'
    },
    {
      id: '5',
      name: 'Persistente',
      description: 'Complete o jogo 5 vezes',
      points: 150,
      icon: '🎯'
    },
    {
      id: '6',
      name: 'Dedicado',
      description: 'Complete o jogo 10 vezes',
      points: 250,
      icon: '💪'
    },
    {
      id: '7',
      name: 'Viciado',
      description: 'Complete o jogo 25 vezes',
      points: 400,
      icon: '🌟'
    }
  ]

  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement
    })
  }

  console.log('Seed executado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 