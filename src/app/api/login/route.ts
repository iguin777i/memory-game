import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        scores: {
          orderBy: {
            time: 'asc'
          },
          take: 1,
          where: {
            completed: true
          }
        }
      }
    })

    // Se o usuário não existe
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não encontrado'
      }, { status: 404 })
    }

    // Verifica se a senha está correta
    if (user.password !== password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Senha incorreta'
      }, { status: 401 })
    }

    // Login bem sucedido
    return NextResponse.json({ 
      success: true,
      userId: user.id,
      bestTime: user.scores[0]?.time || null
    })

  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao processar a requisição'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 