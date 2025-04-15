import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'  // Fixed import path
import { checkAchievements, calculatePoints } from '@/lib/achievements'

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
  try {
    const body = await request.json()
    console.log('Dados recebidos:', body)

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

    try {
      // Primeiro tenta salvar o score básico
      let score = await prisma.score.create({
        data: { 
          userId: userIdString, 
          time: completed ? time : null,
          points: 0,
          completed
        }
      })

      if (completed) {
        // Se completou, então processa conquistas e pontos
        const unlockedAchievements = await checkAchievements(userIdString, { time, completed, mistakes })
        const points = calculatePoints(time, unlockedAchievements)

        // Atualiza o score com os pontos
        score = await prisma.score.update({
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

    } catch (dbError) {
      console.error('Erro específico do banco:', dbError)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao salvar no banco de dados',
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Erro geral:', error)
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