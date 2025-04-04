import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, role, company } = body

    if (!name || !email || !role || !company) {
      return NextResponse.json({ 
        success: false, 
        error: 'Todos os campos são obrigatórios' 
      }, { status: 400 })
    }

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro de conexão com o banco de dados',
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 500 })
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        createdAt: true,
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

    // Se o usuário existe, retorna o ID
    if (existingUser) {
      return NextResponse.json({ 
        success: true,
        userId: existingUser.id,
        isExisting: true
      })
    }

    // Se o usuário não existe, cria um novo
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        company
      }
    })

    return NextResponse.json({ 
      success: true, 
      userId: user.id,
      isExisting: false
    })

  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao processar a requisição',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
