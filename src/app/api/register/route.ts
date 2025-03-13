import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'

export async function POST(request: Request) {
  try {
    const { name, email, phone } = await request.json()
    const generatedPassword = Math.random().toString(36).slice(-8)

    const user = await prisma.user.create({
      data: { name, email, phone, password: generatedPassword },
    })

    // Fecha a conexão após a operação
    await prisma.$disconnect()

    return NextResponse.json({ 
      success: true, 
      password: generatedPassword,
      userId: user.id
    })
  } catch (error) {
    console.error('Erro:', error)
    // Fecha a conexão mesmo em caso de erro
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao criar usuário' 
    }, { status: 500 })
  }
}
