import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'  // Fixed import path
import { checkAchievements, calculatePoints } from '@/lib/achievements'

const REQUEST_TIMEOUT = 10000 // 10 seconds

interface Score {
  id: string;
  userId: string;
  time: number | null;
  points: number;
  completed: boolean;
  user: {
    name: string;
    achievements: Array<{
      achievement: {
        name: string;
        description: string;
        icon: string;
      }
    }>;
  };
}

export async function POST(request: Request) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
  })

  try {
    const body = await Promise.race([
      request.json(),
      timeoutPromise
    ]) as { userId: string; time: number; completed: boolean; mistakes?: number }

    console.log('Dados recebidos:', body)

    const { userId, time, completed, mistakes = 0 } = body

    if (!userId) {
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
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, { status: 404 })
    }

    // Tenta salvar o score básico
    const score = await prisma.score.create({
      data: { 
        userId: userIdString, 
        time: completed ? time : null,
        points: 0,
        completed
      }
    })

    if (completed) {
      // Se completou, processa conquistas e pontos
      const unlockedAchievements = await checkAchievements(userIdString, { time, completed, mistakes })
      const points = calculatePoints(time, unlockedAchievements)

      // Atualiza o score com os pontos
      await prisma.score.update({
        where: { id: score.id },
        data: { points }
      })

      return NextResponse.json({ 
        success: true, 
        score,
        unlockedAchievements,
        message: 'Pontuação registrada com sucesso'
      })
    }

    return NextResponse.json({ 
      success: true, 
      score,
      unlockedAchievements: [],
      message: 'Jogo não completado'
    })

  } catch (error) {
    console.error('Erro ao processar pontuação:', error)
    
    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json({ 
        success: false, 
        error: 'Tempo limite excedido',
        details: 'A requisição demorou muito para ser processada'
      }, { status: 408 })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao processar a requisição',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const scores = await getFormattedScores()
    return NextResponse.json(scores || [])
  } catch (error) {
    console.error('Erro ao buscar pontuações:', error)
    return NextResponse.json([])
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
        { points: 'desc' },
        { completed: 'desc' },
        { time: 'asc' }
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

    return scores.map((score: Score) => ({
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