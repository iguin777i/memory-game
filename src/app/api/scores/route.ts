import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { checkAchievements, calculatePoints } from '@/lib/achievements'

export async function POST(request: Request) {
  try {
    const { userId, time, completed, mistakes = 0 } = await request.json()

    // Converte o userId para string
    const userIdString = String(userId)

    // Busca a pontuação existente do usuário
    const existingScore = await prisma.score.findFirst({
      where: { userId: userIdString }
    })

    // Verifica conquistas se o jogo foi completado
    const unlockedAchievements = completed ? 
      await checkAchievements(userIdString, { time, completed, mistakes }) : 
      []

    // Calcula pontos baseado no tempo e conquistas
    const points = completed ? calculatePoints(time, unlockedAchievements) : 0

    let score

    // Se o jogo não foi completado
    if (!completed) {
      if (existingScore) {
        score = existingScore
      } else {
        score = await prisma.score.create({
          data: { 
            userId: userIdString, 
            time: null,
            points,
            completed: false
          }
        })
      }
    } else if (existingScore) {
      // Se já existe uma pontuação e o jogo foi completado
      if (!existingScore.completed || (time < existingScore.time!)) {
        score = await prisma.score.update({
          where: { id: existingScore.id },
          data: { 
            time,
            points,
            completed: true
          }
        })
      } else {
        score = existingScore
      }
    } else {
      // Se não existe pontuação e o jogo foi completado
      score = await prisma.score.create({
        data: { 
          userId: userIdString, 
          time,
          points,
          completed: true
        }
      })
    }

    await prisma.$disconnect()

    return NextResponse.json({ 
      success: true, 
      score,
      unlockedAchievements,
      message: !completed ? 'Jogo não completado' :
        (existingScore && existingScore.completed && time >= existingScore.time!)
          ? 'Tempo anterior era melhor' 
          : 'Pontuação registrada com sucesso'
    })
  } catch (error) {
    console.error('Erro:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao salvar pontuação' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const scores = await getFormattedScores()
    await prisma.$disconnect()
    return NextResponse.json(scores)
  } catch (error) {
    console.error('Erro:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar pontuações' 
    }, { status: 500 })
  }
}

async function getFormattedScores() {
  const scores = await prisma.score.findMany({
    where: {
      OR: [
        { completed: true },
        { completed: false }
      ]
    },
    orderBy: [
      { points: 'desc' }, // Primeiro ordena por pontos
      { completed: 'desc' }, // Depois por completados
      { time: 'asc' } // Por fim por tempo
    ],
    take: 10,
    include: {
      user: {
        select: {
          name: true,
          achievements: {
            include: {
              achievement: true
            }
          }
        }
      }
    }
  })

  return scores.map(score => ({
    ...score,
    displayTime: score.completed ? `${score.time} segundos` : 'Não completou',
    user: {
      ...score.user,
      achievements: score.user.achievements.map(ua => ({
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon
      }))
    }
  }))
} 