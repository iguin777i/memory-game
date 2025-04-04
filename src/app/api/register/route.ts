import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  console.log('Iniciando processo de registro...')
  
  try {
    const body = await request.json()
    const { name, email, role, company } = body
    
    console.log('Dados recebidos:', { name, email, role, company })

    if (!name || !email || !role || !company) {
      console.log('Dados inválidos:', { name, email, role, company })
      return NextResponse.json({ 
        success: false, 
        error: 'Todos os campos são obrigatórios' 
      }, { status: 400 })
    }

    // Verifica se o usuário já existe
    try {
      console.log('Verificando usuário existente:', email)
      
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

      if (existingUser) {
        console.log('Usuário encontrado:', existingUser.id)
        return NextResponse.json({ 
          success: true,
          userId: existingUser.id,
          isExisting: true
        })
      }

      console.log('Criando novo usuário...')
      const user = await prisma.user.create({
        data: {
          name,
          email,
          role,
          company
        }
      })

      console.log('Usuário criado com sucesso:', user.id)
      return NextResponse.json({ 
        success: true, 
        userId: user.id,
        isExisting: false
      })

    } catch (dbError) {
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Erro conhecido do Prisma:', {
          code: dbError.code,
          message: dbError.message,
          meta: dbError.meta
        })
        return NextResponse.json({ 
          success: false, 
          error: 'Erro no banco de dados',
          details: `${dbError.code}: ${dbError.message}`
        }, { status: 500 })
      }
      
      if (dbError instanceof Prisma.PrismaClientInitializationError) {
        console.error('Erro de inicialização do Prisma:', {
          message: dbError.message,
          errorCode: dbError.errorCode,
          clientVersion: dbError.clientVersion
        })
        return NextResponse.json({ 
          success: false, 
          error: 'Erro de conexão com o banco de dados',
          details: dbError.message
        }, { status: 503 })
      }

      console.error('Erro não identificado do banco:', dbError)
      throw dbError
    }

  } catch (error) {
    console.error('Erro geral no registro:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao processar a requisição',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
