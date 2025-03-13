import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'

export async function POST(request: Request) {
  try {
    const { userId, time, completed = false } = await request.json()

    // Converte o userId para string
    const userIdString = String(userId)

    // Busca a pontuação existente do usuário
    const existingScore = await prisma.score.findFirst({
      where: { userId: userIdString }
    })

    let score

    // Se o jogo não foi completado
    if (!completed) {
      if (existingScore) {
        score = existingScore
      } else {
        score = await prisma.score.create({
          data: { 
            userId: userIdString, 
            time: null, // marca como não completado
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
          completed: true
        }
      })
    }

    await prisma.$disconnect()

    return NextResponse.json({ 
      success: true, 
      score,
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
    const scores = await prisma.score.findMany({
      where: {
        OR: [
          { completed: true },
          { completed: false }
        ]
      },
      orderBy: [
        { completed: 'desc' }, // Completados primeiro
        { time: 'asc' } // Depois ordena por tempo
      ],
      take: 10,
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    // Formata os resultados para a exibição
    const formattedScores = scores.map(score => ({
      ...score,
      displayTime: score.completed ? `${score.time} segundos` : 'Não completou'
    }))

    await prisma.$disconnect()

    return NextResponse.json(formattedScores)
  } catch (error) {
    console.error('Erro:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar pontuações' 
    }, { status: 500 })
  }
} 