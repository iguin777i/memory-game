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

    try {
      console.log('Verificando usuário existente:', email)
      
      const existingUser = await prisma.user.findUnique({
        where: { email }
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
      console.error('Erro do banco de dados:', dbError)
      
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Erro no banco de dados',
          details: dbError.message
        }, { status: 500 })
      }
      
      if (dbError instanceof Prisma.PrismaClientInitializationError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Erro de conexão com o banco de dados',
          details: dbError.message
        }, { status: 503 })
      }

      throw dbError
    }

  } catch (error: unknown) { // Tipando o error como unknown
    console.error('Erro geral:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error
    })
    
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao processar a requisição',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
