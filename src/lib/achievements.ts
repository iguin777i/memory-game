import { prisma } from './server/prisma'

interface Achievement {
  name: string;
  description: string;
  icon: string;
  points: number;
}

interface UserAchievement {
  achievement: {
    name: string;
  };
}

export const ACHIEVEMENTS = {
  FIRST_WIN: {
    name: 'Primeira Vitória',
    description: 'Completou o jogo pela primeira vez',
    icon: '🎉',
    points: 100
  },
  SPEED_DEMON: {
    name: 'Velocista',
    description: 'Completou o jogo em menos de 30 segundos',
    icon: '⚡',
    points: 200
  },
  PERSISTENT: {
    name: 'Persistente',
    description: 'Jogou 5 vezes',
    icon: '💪',
    points: 150
  },
  PERFECT_MEMORY: {
    name: 'Memória Perfeita',
    description: 'Completou o jogo sem erros',
    icon: '🧠',
    points: 300
  }
}

export async function checkAchievements(userId: string, gameStats: { 
  time: number, 
  completed: boolean,
  mistakes: number 
}) {
  const unlockedAchievements: string[] = []
  
  // Busca conquistas existentes do usuário
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true }
  })

  // Verifica primeira vitória
  if (gameStats.completed && !userAchievements.some((ua: UserAchievement) => ua.achievement.name === ACHIEVEMENTS.FIRST_WIN.name)) {
    unlockedAchievements.push(await createAchievement(userId, ACHIEVEMENTS.FIRST_WIN))
  }

  // Verifica velocista
  if (gameStats.completed && gameStats.time < 30 && 
      !userAchievements.some((ua: UserAchievement) => ua.achievement.name === ACHIEVEMENTS.SPEED_DEMON.name)) {
    unlockedAchievements.push(await createAchievement(userId, ACHIEVEMENTS.SPEED_DEMON))
  }

  // Verifica persistente
  const gamesPlayed = await prisma.score.count({ where: { userId } })
  if (gamesPlayed >= 5 && !userAchievements.some((ua: UserAchievement) => ua.achievement.name === ACHIEVEMENTS.PERSISTENT.name)) {
    unlockedAchievements.push(await createAchievement(userId, ACHIEVEMENTS.PERSISTENT))
  }

  // Verifica memória perfeita
  if (gameStats.completed && gameStats.mistakes === 0 && 
      !userAchievements.some((ua: UserAchievement) => ua.achievement.name === ACHIEVEMENTS.PERFECT_MEMORY.name)) {
    unlockedAchievements.push(await createAchievement(userId, ACHIEVEMENTS.PERFECT_MEMORY))
  }

  return unlockedAchievements
}

async function createAchievement(userId: string, achievementData: Achievement) {
  // Verifica se a conquista já existe no banco
  let achievement = await prisma.achievement.findFirst({
    where: { name: achievementData.name }
  })

  // Se não existir, cria
  if (!achievement) {
    achievement = await prisma.achievement.create({
      data: achievementData
    })
  }

  // Verifica se o usuário já tem essa conquista
  const existingUserAchievement = await prisma.userAchievement.findFirst({
    where: {
      userId,
      achievementId: achievement.id
    }
  })

  // Se o usuário ainda não tem a conquista, cria
  if (!existingUserAchievement) {
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id
      }
    })
  }

  return achievement.name
}

export function calculatePoints(time: number, achievements: string[]) {
  // Pontuação base: quanto menor o tempo, maior a pontuação
  let points = Math.max(1000 - Math.floor(time * 10), 100)
  
  // Adiciona pontos das conquistas
  achievements.forEach(achievementName => {
    const achievement = Object.values(ACHIEVEMENTS).find(a => a.name === achievementName)
    if (achievement) {
      points += achievement.points
    }
  })

  return points
} 