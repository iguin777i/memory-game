import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { checkAchievements, calculatePoints } from '@/lib/achievements'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Dados recebidos:', body) // Log dos dados recebidos

    const { userId, time, completed, mistakes = 0 } = body

    if (!userId) {
      console.error('UserId não fornecido')
      return NextResponse.json({ 
        success: false, 
        error: 'UserId não fornecido' 
      }, { status: 400 })
    }

    // Converte o userId para string
    const userIdString = String(userId)

    // Verifica se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id: userIdString }
    })

    if (!userExists) {
      console.error('Usuário não encontrado:', userIdString)
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, { status: 404 })
    }

    // Busca a pontuação existente do usuário
    const existingScore = await prisma.score.findFirst({
      where: { userId: userIdString }
    })

    console.log('Pontuação existente:', existingScore) // Log da pontuação existente

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

    console.log('Pontuação salva:', score) // Log da pontuação salva

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
    console.error('Erro detalhado:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao salvar pontuação',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const scores = await getFormattedScores()
    await prisma.$disconnect()
    return NextResponse.json(scores || []) // Garante que retorna array vazio se não houver scores
  } catch (error) {
    console.error('Erro ao buscar pontuações:', error)
    await prisma.$disconnect()
    return NextResponse.json([]) // Retorna array vazio em caso de erro
  }
}

async function getFormattedScores() {
  try {
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

    if (!scores) return []

    return scores.map(score => ({
      id: score.id,
      userId: score.userId,
      time: score.time,
      points: score.points,
      completed: score.completed,
      displayTime: score.completed ? `${score.time} segundos` : 'Não completou',
      user: {
        name: score.user.name,
        achievements: score.user.achievements.map(ua => ({
          name: ua.achievement.name,
          description: ua.achievement.description,
          icon: ua.achievement.icon
        }))
      }
    }))
  } catch (error) {
    console.error('Erro ao formatar scores:', error)
    return []
  }
} 